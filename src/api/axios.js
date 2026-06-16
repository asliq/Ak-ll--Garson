import axios from 'axios' 

// Axios instance - tüm API çağrıları için nedir?
// baseURL: API'nin temel URL'si
// headers: İstek üst bilgileri
// timeout: İstek zaman aşımı süresi
// axios.create: Axios instance oluşturur
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor - her istekte çalışır nedir?
// config.method: İstek yöntemi (GET, POST, PUT, DELETE, vs.)
// config.url: İstek URL'si
// config.data: İstek verisi (JSON formatında)
// config.headers: İstek üst bilgileri
// config.params: İstek parametreleri
// config.timeout: İstek zaman aşımı süresi
// config.withCredentials: Kimlik doğrulama bilgilerini içerme
// config.responseType: Yanıt türü (json, text, stream, blob, arraybuffer)
api.interceptors.request.use(
  (config) => {
    // Burada auth token eklenebilir
    // config.headers.Authorization = `Bearer ${token}`
    console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - her yanıtta çalışır. neydi?
// response.status: Yanıtın HTTP durum kodu
// response.config.url: İstek URL'si
// response.data: Yanıt verisi (JSON formatında)
// response.headers: Yanıt üst bilgileri
// response.config: İstek yapılandırması
// response.request: İstek nesnesi
// response.statusText: Yanıt durum açıklaması
// response.config.method: İstek yöntemi (GET, POST, PUT, DELETE, vs.)
// response.config.headers: İstek üst bilgileri
// response.config.data: İstek verisi (JSON formatında)
// response.config.params: İstek parametreleri
// response.config.timeout: İstek zaman aşımı süresi
// response.config.withCredentials: Kimlik doğrulama bilgilerini içerme
// response.config.responseType: Yanıt türü (json, text, stream, blob, arraybuffer)
// response.config.transformResponse: Yanıt dönüştürme fonksiyonları
// response.config.transformRequest: İstek dönüştürme fonksiyonları   
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ [${error.response?.status}] ${error.config?.url}`)
    return Promise.reject(error)
  }
)

export default api

