import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

/**
 * WebSocket Hook - Gerçek zamanlı güncellemeler için
 * 
 * Bu hook, WebSocket bağlantısını yönetir ve gelen mesajları işler.
 * Gerçek bir WebSocket sunucusu olmadığı için, EventSource (SSE) simülasyonu kullanır.
 */

export const useWebSocket = (url = null) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // WebSocket mesajını işle
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Mesaj tipine göre işlem yap
      switch (data.type) {
        case 'ORDER_CREATED':
          // Yeni sipariş oluşturuldu
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          addNotification({
            type: 'success',
            message: `Yeni sipariş: Masa ${data.payload.tableNumber}`,
            duration: 5000
          });
          toast.success(`Yeni sipariş: Masa ${data.payload.tableNumber}`);
          break;

        case 'ORDER_UPDATED':
          // Sipariş güncellendi
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['orders', data.payload.id] });
          addNotification({
            type: 'info',
            message: `Sipariş güncellendi: ${data.payload.status}`,
            duration: 3000
          });
          break;

        case 'TABLE_UPDATED':
          // Masa durumu değişti
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          queryClient.invalidateQueries({ queryKey: ['tables', data.payload.id] });
          addNotification({
            type: 'info',
            message: `Masa ${data.payload.number}: ${data.payload.status}`,
            duration: 3000
          });
          break;

        case 'KITCHEN_ORDER':
          // Mutfak siparişi
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          addNotification({
            type: 'warning',
            message: `Mutfak: Yeni sipariş hazırlanıyor`,
            duration: 4000
          });
          toast('🍳 Mutfak siparişi hazırlanıyor', {
            icon: '👨‍🍳',
          });
          break;

        case 'PAYMENT_COMPLETED':
          // Ödeme tamamlandı
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          addNotification({
            type: 'success',
            message: `Ödeme tamamlandı: ${data.payload.amount} TL`,
            duration: 5000
          });
          toast.success(`💰 Ödeme tamamlandı: ${data.payload.amount} TL`);
          break;

        case 'STOCK_ALERT':
          // Stok uyarısı
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          addNotification({
            type: 'error',
            message: `Düşük stok: ${data.payload.itemName}`,
            duration: 6000
          });
          toast.error(`⚠️ Düşük stok: ${data.payload.itemName}`);
          break;

        case 'RESERVATION_NEW':
          // Yeni rezervasyon
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          addNotification({
            type: 'info',
            message: `Yeni rezervasyon: ${data.payload.customerName}`,
            duration: 5000
          });
          toast(`📅 Yeni rezervasyon: ${data.payload.customerName}`, {
            icon: '🎉',
          });
          break;

        default:
          console.log('Bilinmeyen mesaj tipi:', data.type);
      }
    } catch (error) {
      console.error('WebSocket mesajı işlenirken hata:', error);
    }
  }, [queryClient, addNotification]);

  // Bağlantıyı kur
  const connect = useCallback(() => {
    // Gerçek WebSocket sunucusu yok, simülasyon yapıyoruz
    if (!url) {
      // Simüle edilmiş WebSocket olayları
      simulateWebSocketEvents();
      return;
    }

    try {
      // Gerçek WebSocket bağlantısı (opsiyonel)
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket bağlantısı kuruldu');
        reconnectAttempts.current = 0;
        toast.success('🔌 Canlı güncellemeler aktif');
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onerror = (error) => {
        console.error('WebSocket hatası:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket bağlantısı kapandı');
        
        // Otomatik yeniden bağlan
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            console.log(`Yeniden bağlanma denemesi ${reconnectAttempts.current}...`);
            connect();
          }, RECONNECT_DELAY);
        } else {
          toast.error('Canlı güncellemeler devre dışı');
        }
      };
    } catch (error) {
      console.error('WebSocket bağlantısı kurulamadı:', error);
    }
  }, [url, handleMessage]);

  // WebSocket olaylarını simüle et (demo için)
  const simulateWebSocketEvents = useCallback(() => {
    // Her 30 saniyede bir rastgele olay üret
    const intervalId = setInterval(() => {
      const events = [
        {
          type: 'ORDER_CREATED',
          payload: {
            id: Date.now(),
            tableNumber: Math.floor(Math.random() * 20) + 1,
            status: 'pending'
          }
        },
        {
          type: 'ORDER_UPDATED',
          payload: {
            id: Date.now(),
            status: 'preparing'
          }
        },
        {
          type: 'TABLE_UPDATED',
          payload: {
            id: Math.floor(Math.random() * 20) + 1,
            number: Math.floor(Math.random() * 20) + 1,
            status: 'occupied'
          }
        },
        {
          type: 'KITCHEN_ORDER',
          payload: {
            orderId: Date.now(),
            items: []
          }
        }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      handleMessage({ data: JSON.stringify(randomEvent) });
    }, 30000); // 30 saniye

    // Cleanup
    return () => clearInterval(intervalId);
  }, [handleMessage]);

  // Mesaj gönder
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket bağlantısı yok veya hazır değil');
    }
  }, []);

  // Bağlantıyı kapat
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Mount/Unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    disconnect,
    reconnect: connect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};

export default useWebSocket;

