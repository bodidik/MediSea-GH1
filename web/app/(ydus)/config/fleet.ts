// "C:\Users\hucig\Medknowledge\web\app\(ydus)\config\fleet.ts"
export const FLEET_STATUS = [
  { 
    id: "gastroenteroloji", 
    name: "Gastroenteroloji", 
    shipType: "Kadırga", 
    currentPort: "İstanbul", // Haritadaki Ambarlı/Haydarpaşa bölgesi
    progress: 40, 
    status: "Boğaz Geçiliyor",
    lastReport: "GİS Kanamaları tamamlandı, Hepatoloji rotasına girildi."
  },
  { 
    id: "kardiyoloji", 
    name: "Kardiyoloji", 
    shipType: "Fırkateyn", 
    currentPort: "Samsun", // Orta Karadeniz ana ikmal noktası
    progress: 25, 
    status: "Seyir Halinde",
    lastReport: "AKS ve Kalp Yetersizliği konuları güvertede."
  },
  { 
    id: "nefroloji", 
    name: "Nefroloji", 
    shipType: "Kruvazör", 
    currentPort: "Mersin", // Akdeniz'e giriş yapıldı
    progress: 85, 
    status: "Fırtına Bekleniyor",
    lastReport: "Glomerülonefritler dalgalı, İskenderun limanı ufukta."
  },
  { 
    id: "endokrinoloji", 
    name: "Endokrinoloji", 
    shipType: "Galleon", 
    currentPort: "İzmir", // Ege Bölge Komutanlığı
    progress: 65, 
    status: "Liman Hazırlığı",
    lastReport: "Diyabet ve Tiroid ikmali tamamlandı."
  },
  { 
    id: "hematoloji", 
    name: "Hematoloji", 
    shipType: "Sandal", 
    currentPort: "Hopa", // Başlangıç noktası
    progress: 5, 
    status: "Vira Bismillah",
    lastReport: "Anemiler için demir alındı, rota Trabzon."
  }
];