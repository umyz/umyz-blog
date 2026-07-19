# umyz Yönetim Sistemi Uygulama Planı

Bu belge, Git/MDX tabanlı umyz blogunun WordPress rahatlığında yönetilmesi için canlı takip listesidir. Her madde tamamlandıkça `[x]` yapılacaktır.

## Uygulama önceliği

1. Tek tuşla derleme, Git yayını ve yerel blog yeniden başlatma.
2. Yayın günlüğü, günlük yedekleme ve medya yönetimi.
3. Blog arama/arşiv/SEO geliştirmeleri.
4. Hata–yükleme deneyimi iyileştirmeleri.
5. En son: tek yönetici parolası ve oturum koruması.

## 0. Mevcut temel

- [x] Next.js blog ve bağımsız `umyz-admin` servisi oluşturuldu.
- [x] Docker ve yerel çalışma yapılandırması eklendi.
- [x] Site ayarları için `src/data/site-config.json` altyapısı eklendi.
- [x] Ana sayfa, footer, reklam alanı, sosyal bağlantılar ve özel sayfa ayarları admin üzerinden düzenlenebilir hale getirildi.
- [x] Blog ve admin yerel olarak erişilebilir durumda.

## 1. İçerik yönetimi

- [x] Upstream'deki eski MDX makalelerini geri içeri aktar ve admin listesinde göster. (65 makale geri alındı.)
- [x] Makale listesine arama, durum, tarih, kategori, etiket ve yazar filtreleri ekle.
- [x] Taslak, planlandı, yayında ve arşiv durumlarını MDX meta verisiyle destekle; yayında olmayanları blogdan gizle.
- [x] Planlanan yazıları belirlenen tarihte otomatik olarak blog çıktısına dahil et.
- [x] Yeni, düzenle, kopyala, çöpe taşı, geri yükle ve kalıcı sil işlemlerini ekle.
- [x] Otomatik slug, otomatik taslak kaydı, kaydedilmemiş değişiklik uyarısı ve içerik önizlemesi ekle.
- [x] Hakkımda, iletişim ve gizlilik gibi sabit sayfalar için ayrı yönetim görünümü ekle.

## 2. Admin deneyimi

- [x] Admin panelini yeniden tasarla: net yan menü, gösterge paneli, kartlar ve mobil uyum.
- [x] Markdown alanına görsel zengin editör ekle. (Başlık, kalın/italik, liste, alıntı, kod ve geri alma; gelişmiş MDX için kaynak modu korunur.)
- [x] Düzenleyicide canlı önizleme ve kontrollü MDX blokları ekle. (Görsel zengin editör sonraki dilimde.)
- [x] İyi hata, başarı, yükleme ve boş durum ekranları ekle. (Başarı/hata bildirimleri, yüklenme ve boş durum metinleri eklendi.)

## 3. Medya ve yönetim verileri

- [x] Medya kütüphanesi: kart görünümü, arama, klasörleme ve kapak görseli seçimi.
- [x] Görsel yüklemede WebP dönüşümü ve en fazla 2560px boyutlandırma ekle. (GIF animasyonları korunur.)
- [x] Medya için düzenlenebilir alt metin ve başlık yönetimi ekle.
- [x] Kullanılmayan medya taraması ekle. (Raporlama yapar; otomatik silmez.)
- [x] Yazar profili, avatarı ve sosyal bağlantıları için yönetim ekranı ekle.
- [x] Kategori/etiket yönetimi ve boş taksonomileri gizleme ekle.
- [x] Revizyon geçmişi ve geri alma ekle. (Her kayıttan önceki MDX sürümü saklanır.)
- [x] Revizyonlar arası görsel karşılaştırma ekle.

## 4. Yayın, güvenlik ve operasyon

- [ ] Tek yönetici parolalı giriş ve oturum koruması ekle.
- [x] Yayın öncesi değişiklik özeti/onayı, Git sonucu ve hata günlüğü ekle.
- [x] Tek tuşla derleme, Git yayını ve yerel blog yeniden başlatma akışı ekle.
- [x] Günlük içerik, medya ve Git yedeği ekle. (Yerel görev her gün 03:00’te çalışır.)

## 5. Blog deneyimi

- [x] Makale sayfalarına okuma süresi ekle.
- [x] Arama, ilgili yazılar ve içerik serilerini tamamla.
- [x] Sayfalama ile dinamik kategori/etiket arşivlerini tamamla.
- [x] Editöre başlık, açıklama, slug, kapak ve içerik için SEO kontrol listesi ekle.
- [x] Open Graph/Canonical doğrulama ve görsel alt metin uyarıları ekle.
- [x] Taslak/planlanmış içeriklerin ziyaretçilere görünmemesini garanti et. (Tek görünürlük kuralı; makale listesi, rota haritası, RSS ve sitemap aynı kaynaktan beslenir.)

## Notlar

- Ayarlar ve içerikler Git altında kalır; admin paneli yalnızca bunları güvenli biçimde yönetir.
- Her aşamada lint/build ve mümkün olan yerel kullanıcı akışı doğrulaması yapılır.
