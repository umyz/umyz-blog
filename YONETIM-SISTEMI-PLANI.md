# umyz Yönetim Sistemi Uygulama Planı

Bu belge, Git/MDX tabanlı umyz blogunun WordPress rahatlığında yönetilmesi için canlı takip listesidir. Her madde tamamlandıkça `[x]` yapılacaktır.

## 0. Mevcut temel

- [x] Next.js blog ve bağımsız `umyz-admin` servisi oluşturuldu.
- [x] Docker ve yerel çalışma yapılandırması eklendi.
- [x] Site ayarları için `src/data/site-config.json` altyapısı eklendi.
- [x] Ana sayfa, footer, reklam alanı, sosyal bağlantılar ve özel sayfa ayarları admin üzerinden düzenlenebilir hale getirildi.
- [x] Blog ve admin yerel olarak erişilebilir durumda.

## 1. İçerik yönetimi

- [x] Upstream'deki eski MDX makalelerini geri içeri aktar ve admin listesinde göster. (65 makale geri alındı.)
- [x] Makale listesine arama, durum, tarih ve kategori filtreleri ekle. (Etiket/yazar filtresi sonraki dilimde.)
- [x] Taslak, planlandı, yayında ve arşiv durumlarını MDX meta verisiyle destekle; yayında olmayanları blogdan gizle.
- [x] Yeni, düzenle, kopyala, çöpe taşı, geri yükle ve kalıcı sil işlemlerini ekle.
- [x] Otomatik slug, otomatik taslak kaydı, kaydedilmemiş değişiklik uyarısı ve içerik önizlemesi ekle.
- [x] Hakkımda, iletişim ve gizlilik gibi sabit sayfalar için ayrı yönetim görünümü ekle.

## 2. Admin deneyimi

- [x] Admin panelini yeniden tasarla: net yan menü, gösterge paneli, kartlar ve mobil uyum.
- [x] Markdown alanına görsel zengin editör ekle. (Başlık, kalın/italik, liste, alıntı, kod ve geri alma; gelişmiş MDX için kaynak modu korunur.)
- [x] Düzenleyicide canlı önizleme ve kontrollü MDX blokları ekle. (Görsel zengin editör sonraki dilimde.)
- [ ] İyi hata, başarı, yükleme ve boş durum ekranları ekle.

## 3. Medya ve yönetim verileri

- [x] Medya kütüphanesi: kart görünümü, arama, klasörleme ve kapak görseli seçimi.
- [ ] Görsel yüklemede boyutlandırma/WebP dönüşümü, alt metin ve başlık desteği ekle.
- [x] Kullanılmayan medya taraması ekle. (Raporlama yapar; otomatik silmez.)
- [x] Yazar profili, avatarı ve sosyal bağlantıları için yönetim ekranı ekle.
- [x] Kategori/etiket yönetimi ve boş taksonomileri gizleme ekle.
- [x] Revizyon geçmişi ve geri alma ekle. (Her kayıttan önceki MDX sürümü saklanır.)
- [ ] Revizyonlar arası görsel karşılaştırma ekle.

## 4. Yayın, güvenlik ve operasyon

- [ ] Tek yönetici parolalı giriş ve oturum koruması ekle.
- [ ] Yayın öncesi değişiklik özeti/onayı, Git sonucu ve hata günlüğü ekle.
- [ ] Tek tuşla derleme, yeniden başlatma ve canlıya alma akışı ekle.
- [ ] Günlük içerik, medya ve Git yedeği ekle.

## 5. Blog deneyimi

- [ ] Arama, ilgili yazılar, okuma süresi ve içerik serileri ekle.
- [ ] Sayfalama ile dinamik kategori/etiket arşivlerini tamamla.
- [ ] SEO kontrol listesi, Open Graph/Canonical doğrulama ve görsel alt metin uyarıları ekle.
- [ ] Taslak/planlanmış içeriklerin ziyaretçilere görünmemesini garanti et.

## Notlar

- Ayarlar ve içerikler Git altında kalır; admin paneli yalnızca bunları güvenli biçimde yönetir.
- Her aşamada lint/build ve mümkün olan yerel kullanıcı akışı doğrulaması yapılır.
