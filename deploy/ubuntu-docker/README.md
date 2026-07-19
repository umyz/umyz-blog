# Ubuntu Docker kurulumu

Bu klasör, admin panelinden yapılan `Git ile yayınla` işleminin Linux/Docker karşılığını sağlar. Admin derlemeyi ve Git push işlemini yapar; blog konteyneri paylaşılan yeniden başlatma sinyalini görüp Next.js sürecini yeniden başlatır.

## Kurulum

```bash
git clone git@github.com:umyz/umyz-blog.git /opt/umyz-blog
cd /opt/umyz-blog/deploy/ubuntu-docker
docker compose up -d --build
```

İlk açılışta `http://SUNUCU_IP:3001` adresinden yönetici parolasını oluşturun. Blog `:3000`, admin `:3001` portunda çalışır.

## GitHub yazma yetkisi

Sunucudaki `/root/.ssh` altında GitHub hesabınıza eklenmiş bir SSH deploy anahtarı bulunmalıdır. Deponun `origin` adresi SSH olmalıdır:

```bash
cd /opt/umyz-blog
git remote set-url origin git@github.com:umyz/umyz-blog.git
ssh -T git@github.com
```

Bu anahtar yalnızca ilgili depoya yazma izni taşımalıdır. HTTPS token'ını compose dosyasına veya Git deposuna yazmayın.

## Repo değiştirme

Git hedefi admin ayarlarından değil, `/opt/umyz-blog/.git/config` içindeki `origin` adresinden gelir. Hedef değiştirmek için `git remote set-url origin ...` kullanın ve adminde “Durumu yenile” seçin.

## Güncelleme

```bash
cd /opt/umyz-blog
git pull --ff-only
cd deploy/ubuntu-docker
docker compose up -d --build
```
