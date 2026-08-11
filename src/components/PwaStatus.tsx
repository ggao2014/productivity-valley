import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

export function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [workerError, setWorkerError] = useState(false)
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null)
  const [offlineReady, setOfflineReady] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => {
      setOnline(false)
      setWasOffline(true)
    }
    const onInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('beforeinstallprompt', onInstall)

    let cancelled = false
    let updateTimer = 0
    const cleanups: Array<() => void> = []

    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      void navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .then((registered) => {
          if (cancelled) return
          setRegistration(registered)
          if (
            !navigator.serviceWorker.controller &&
            !sessionStorage.getItem('productivity-valley-offline-ready-seen')
          ) {
            void navigator.serviceWorker.ready.then(() => {
              if (cancelled) return
              sessionStorage.setItem(
                'productivity-valley-offline-ready-seen',
                '1',
              )
              setOfflineReady(true)
            })
          }
          if (registered.waiting) setNeedRefresh(true)
          const onUpdateFound = () => {
            const worker = registered.installing
            worker?.addEventListener('statechange', () => {
              if (
                worker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setNeedRefresh(true)
              }
            })
          }
          registered.addEventListener('updatefound', onUpdateFound)
          cleanups.push(() =>
            registered.removeEventListener('updatefound', onUpdateFound),
          )

          const checkUpdate = () => {
            void registered.update().catch(() => {
              if (!cancelled) setWorkerError(true)
            })
          }
          checkUpdate()
          const onVisible = () => {
            if (document.visibilityState === 'visible') checkUpdate()
          }
          document.addEventListener('visibilitychange', onVisible)
          window.addEventListener('pageshow', checkUpdate)
          updateTimer = window.setInterval(checkUpdate, 60_000)
          cleanups.push(() => {
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('pageshow', checkUpdate)
            window.clearInterval(updateTimer)
          })
        })
        .catch(() => {
          if (!cancelled) setWorkerError(true)
        })
    }

    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onInstall)
      for (const cleanup of cleanups) cleanup()
    }
  }, [])

  const applyUpdate = () => {
    const waiting = registration?.waiting
    if (!waiting) {
      void registration?.update().catch(() => setWorkerError(true))
      return
    }
    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    })
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  const showReturned = online && wasOffline
  const statusAsset = !online
    ? 'offline-v1.webp'
    : needRefresh || workerError
      ? 'update-v1.webp'
      : null
  if (
    online &&
    !showReturned &&
    !offlineReady &&
    !needRefresh &&
    !workerError &&
    (!installPrompt || isStandalone())
  ) {
    return null
  }

  return (
    <aside className="pwa-status" aria-live="polite">
      {statusAsset && (
        <img
          src={`${import.meta.env.BASE_URL}art/beta/${statusAsset}`}
          alt=""
          draggable={false}
        />
      )}
      {!online && (
        <>
          <strong>现在是离线状态</strong>
          <span>已缓存的山谷仍可使用，联网后会继续正常更新。</span>
        </>
      )}
      {showReturned && !needRefresh && (
        <>
          <strong>已经重新联网</strong>
          <span>本机进度一直都在。</span>
          <button onClick={() => setWasOffline(false)}>知道了</button>
        </>
      )}
      {offlineReady && online && !showReturned && (
        <>
          <strong>山谷已可离线使用</strong>
          <span>即使暂时没有网络，也能打开已缓存的版本。</span>
          <button onClick={() => setOfflineReady(false)}>知道了</button>
        </>
      )}
      {needRefresh && (
        <>
          <strong>有一个新版本</strong>
          <span>刷新前，当前进度已保存在本机。</span>
          <div>
            <button
              onClick={() => {
                applyUpdate()
              }}
            >
              更新并刷新
            </button>
            <button onClick={() => setNeedRefresh(false)}>稍后</button>
          </div>
        </>
      )}
      {workerError && !needRefresh && online && (
        <>
          <strong>离线准备暂时失败</strong>
          <span>在线使用不受影响。稍后刷新页面，会自动再试一次。</span>
          <button onClick={() => window.location.reload()}>重新尝试</button>
        </>
      )}
      {installPrompt && online && !needRefresh && !isStandalone() && (
        <>
          <strong>把山谷放到主屏幕</strong>
          <span>像普通应用一样打开，进度仍保存在这台设备。</span>
          <button
            onClick={async () => {
              await installPrompt.prompt()
              await installPrompt.userChoice
              setInstallPrompt(null)
            }}
          >
            安装
          </button>
        </>
      )}
    </aside>
  )
}

export function PwaInstallGuide() {
  const apple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  return (
    <section className="install-guide" aria-labelledby="install-title">
      <img
        src={`${import.meta.env.BASE_URL}art/beta/update-v1.webp`}
        alt=""
        draggable={false}
      />
      <h2 className="section-title" id="install-title">
        安装与离线
      </h2>
      {isStandalone() ? (
        <p className="hint">山谷已经从主屏幕独立运行；离线缓存会自动维护。</p>
      ) : apple ? (
        <ol>
          <li>用 Safari 打开山谷。</li>
          <li>点底部“分享”按钮。</li>
          <li>选择“添加到主屏幕”，再确认“添加”。</li>
        </ol>
      ) : (
        <p className="hint">
          浏览器支持安装时，页面底部会出现“安装”提示；也可从浏览器菜单选择“安装应用”。
        </p>
      )}
      <small>首次完整打开并联网后，主要界面可在离线状态继续使用。</small>
    </section>
  )
}
