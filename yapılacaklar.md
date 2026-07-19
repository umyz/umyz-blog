# Yapılacaklar Listesi & Kusursuz Kurulum Planı (https://umyz.tr)

Bu dosya, **TechHutTV/techhut.tv** altyapısını temel alarak **umyz.tr** blog projesini hayata geçirmek, projeyi Dockerize etmek ve güncellemelerden etkilenmeyecek bağımsız bir admin paneli kurmak için izleyeceğimiz tüm adımları içerir.

---

## 🗺️ Faz 1: Projenin Kurulumu ve Özelleştirilmesi

- [ ] **1.1. Kaynak Kodların Alınması**
  - TechHutTV/techhut.tv projesinin güncel kodlarını `umyz-blog` klasörüne klonlayın veya indirin.
- [ ] **1.2. Marka ve Domain Ayarları**
  - Proje genelindeki `techhut.tv` referanslarını `umyz.tr` olarak güncelleyin.
  - `package.json` içerisindeki proje adını `umyz-blog` veya `umyz-tr` olarak güncelleyin.
  - `public/robots.txt` dosyasındaki sitemap URL'ini `https://umyz.tr/sitemap.xml` olarak değiştirin.
  - `scripts/generate-sitemap.mjs` içerisindeki varsayılan site URL'ini `https://umyz.tr` yapın.
- [ ] **1.3. Varsayılan İçeriklerin Temizlenmesi**
  - Orijinal projeden kalan örnek makaleleri (`src/content/`) ve yazar kayıtlarını (`src/data/authors.js`) temizleyerek şablon haline getirin.

---

## 🐳 Faz 2: Dockerize Etme (Geliştirme ve Canlı Ortam)

- [ ] **2.1. Next.js Dockerfile Oluşturulması**
  - Next.js 15 projesini hem geliştirme (dev) hem de canlı (production/SSG) modda çalıştırabilecek çok aşamalı (multi-stage) bir `Dockerfile` hazırlayın.
- [ ] **2.2. Docker Compose Konfigürasyonu**
  - `docker-compose.yml` dosyasını oluşturun.
  - Geliştirme sürecinde kod değişikliklerinin anında container'a yansıması için Next.js kaynak kodunu ve `src/content` klasörünü "volume mapping" ile container'a bağlayın.

---

## 🛠️ Faz 3: Bağımsız Admin Paneli Geliştirme (umyz-admin)

Bu aşamada Next.js projesinden tamamen bağımsız, güncellemelerde bozulmayacak mikro servis tasarlanacaktır.

- [ ] **3.1. Admin Panel Altyapısının Kurulması**
  - `umyz-admin` adında ayrı bir Node.js/Express (backend) ve React (frontend) projesi başlatın.
  - Docker Compose'a bu servisi ekleyin ve Next.js'in `src/content` ve `public/docs-static` klasörlerini bu servise volume olarak bağlayın.
- [ ] **3.2. AST (Abstract Syntax Tree) Parser Geliştirme**
  - MDX dosyalarındaki JavaScript export'larını (`export const title = "..."`) bozmadan okuyup yazabilen `@babel/parser` ve `@babel/generator` tabanlı bir dosya yöneticisi yazın.
- [ ] **3.3. Görsel Editör Entegrasyonu**
  - Form tabanlı meta veri düzenleme arayüzü tasarlayın (Başlık, Açıklama, Kategori, Etiketler, Yazar).
  - Makale içeriği için zengin Markdown desteği sunan bir editör (örn. *TipTap* veya *Milkdown*) entegre edin.
- [ ] **3.4. Medya (Görsel) Yöneticisi**
  - Sürükle-bırak yöntemiyle yüklenen görselleri otomatik olarak Next.js'in `public/docs-static/img/YYYY/MM/makale-slug/` klasörüne kaydeden ve MDX içerisine yolunu yazan backend rotasını yazın.
- [ ] **3.5. Git Otomasyonu**
  - Admin panelinde "Yayınla" butonuna basıldığında arka planda `git add`, `git commit -m "Makale eklendi: ..."` ve `git push` komutlarını çalıştıracak altyapıyı backend'e ekleyin.

---

## 🔄 Faz 4: Entegrasyon ve Testler

- [ ] **4.1. Local Docker Testleri**
  - `docker compose up` komutuyla tüm sistemi ayağa kaldırın.
  - Admin panelinden makale ekleyin, Next.js uygulamasının bunu anında algılayıp (hot reload) sayfayı oluşturduğunu test edin.
- [ ] **4.2. SEO ve Hız Testleri**
  - Derlenen statik sayfaların SEO etiketlerini, sitemap.xml ve robots.txt dosyalarının doğruluğunu test edin.
  - Lighthouse/PageSpeed testlerini gerçekleştirin.

---

## 🚀 Faz 5: Canlıya Dağıtım (Deployment)

- [ ] **5.1. Sunucu Kurulumu**
  - VPS veya bulut sunucuda Docker ve Docker Compose kurulumlarını yapın.
  - Nginx veya Traefik ile SSL sertifikalı ters proxy (reverse proxy) kurulumunu tamamlayın.
- [ ] **5.2. CI/CD Pipeline Yapılandırması**
  - GitHub Actions veya Vercel entegrasyonu ile ana kod güncellendiğinde veya yeni makale push edildiğinde sitenin otomatik olarak yeniden derlenip yayına alınmasını sağlayın.
