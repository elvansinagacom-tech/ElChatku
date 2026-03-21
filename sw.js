/* ElChat Service Worker - Push Notifications */
const CACHE_NAME = 'elchat-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

/* Handle Push Notification */
self.addEventListener('push', function(e) {
  var data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch(err) {
    data = { title: 'ElChat', body: e.data ? e.data.text() : 'Pesan baru masuk.' };
  }

  var title   = data.title   || 'ElChat';
  var options = {
    body:    data.body    || 'Kamu memiliki pesan baru.',
    icon:    data.icon    || '/icon-192.png',
    badge:   data.badge   || '/icon-192.png',
    tag:     data.tag     || 'elchat-msg',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      roomId: data.roomId || null
    }
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

/* Handle Notification Click */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: url });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
