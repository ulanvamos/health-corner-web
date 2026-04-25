# Health Corner Genel Geliştirme Raporu

Tarih: 25 Nisan 2026

Bu dosya, Convex altyapısının kaldırılmasından başlayarak Supabase geçişi, hesap mantığı, arayüz düzenlemeleri, login güncellemesi ve veritabanı hazırlıklarına kadar yapılan işleri tek yerde toplar.

## Kısa Özet

Health Corner artık Next.js + Supabase ekseninde ilerleyen web tabanlı bir diyetisyen-danışan takip uygulaması olarak şekillendi. Convex tarafı kaldırıldı, Supabase bağlantısı kuruldu, danışan ve diyetisyen tarafları ayrıldı, rol bazlı giriş mantığı eklendi, diyetisyen başvurusu ve admin onay akışı için temel ekranlar hazırlandı.

## Convex Temizliği

- Convex kullanımından vazgeçildi.
- `convex/` ve `.convex/` tarafındaki proje bağımlılığı kaldırıldı.
- `package.json` içinde Convex bağımlılığı bırakılmadı.
- Convex environment değişkenleri proje akışından çıkarıldı.
- Layout tarafında Convex provider kullanılmıyor; uygulama artık `DemoAppProvider` üzerinden Supabase destekli ilerliyor.
- Güncel kaynak kodda ve `package.json` içinde `convex` referansı bulunmuyor.

## Supabase Geçişi

- Backend tercihi Supabase olarak netleştirildi.
- `@supabase/supabase-js` dependency olarak projede yer alıyor.
- Supabase client dosyası oluşturuldu:

```text
src/lib/supabase.ts
```

- Client tarafında `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` üzerinden bağlantı kuruluyor.
- Demo geliştirme için Supabase URL ve anon key fallback olarak dosyada mevcut.
- Supabase tarafındaki proje referansı şu an:

```text
emeuelwnghssbywebvqn
```

- Supabase MCP server entegrasyonu denendi ve bağlandı.
- Supabase MCP içinde SQL çalıştırma aracı olmadığı tespit edildi.
- MCP access token rapora yazılmadı; güvenlik nedeniyle tekrar dokümante edilmedi.

## SQL ve Veritabanı Kurulumu

Supabase schema dosyası hazırlandı:

```text
supabase/healthcorner_schema.sql
```

Migration dosyası oluşturuldu:

```text
supabase/migrations/20260425_000001_healthcorner_schema.sql
```

SQL uygulamak için iki yol eklendi:

```text
scripts/db_apply_schema.ps1
scripts/supabase_db_push.ps1
```

`package.json` içine şu scriptler eklendi:

```json
"db:apply:psql": "powershell -ExecutionPolicy Bypass -File scripts/db_apply_schema.ps1",
"db:push": "powershell -ExecutionPolicy Bypass -File scripts/supabase_db_push.ps1"
```

Kullanım notları ayrıca şu dosyada tutuluyor:

```text
DATABASE_SETUP.md
```

Hazırlanan schema ana tabloları:

- `profiles`
- `clients`
- `dietitians`
- `dietitian_applications`
- `admin_users`

Hazırlanan storage alanı:

- `dietitian-documents`

Not: Schema hazırlandı ancak uzak Supabase veritabanına uygulanması için DB şifresi gerekiyor. `npm run db:push` veya `npm run db:apply:psql` ile uygulanabilir.

## Hesap ve Rol Mantığı

Giriş akışı sadece sabit demo kullanıcıya bağlanmasın diye hesap modeli yeniden ele alındı.

Eklenen roller:

- `client`
- `dietitian`
- `admin`

Eklenen hesap durumları:

- `active`
- `pending`
- `rejected`
- `suspended`

Provider içinde rol çözümleme mantığı eklendi:

- Önce Supabase tarafındaki kullanıcı bilgisi okunmaya çalışılıyor.
- Eğer tablo verisi yoksa Auth metadata fallback olarak kullanılıyor.
- Diyetisyen hesapları demo diyetisyen dışında varsayılan olarak `pending` kabul ediliyor.
- `elif@healthcorner.demo` aktif diyetisyen demo hesabı olarak ele alınıyor.
- `zeynep@example.com` danışan demo hesabı olarak kullanılmaya devam ediyor.

Giriş sonrası yönlendirme:

- Admin: `/dashboard/admin`
- Danışan: `/dashboard/client`
- Aktif diyetisyen: `/dashboard/dietitian`
- Onay bekleyen diyetisyen: `/dashboard/dietitian/pending`

## Kayıt Akışları

Kayıt ekranları ayrıldı:

```text
src/app/(auth)/register/page.tsx
src/app/(auth)/register/client/page.tsx
src/app/(auth)/register/dietitian/page.tsx
```

Danışan kaydı:

- E-posta, şifre ve ad bilgisiyle hesap oluşturuyor.
- Rol metadata olarak `client` atanıyor.
- Hesap durumu `active` kabul ediliyor.
- Kayıt sonrası danışan onboarding akışına yönleniyor.

Diyetisyen başvurusu:

- Ayrı bir başvuru ekranı var.
- Ad, e-posta, telefon, uzmanlık, lisans/belge bilgisi gibi alanlar alınıyor.
- Rol metadata olarak `dietitian` atanıyor.
- Hesap durumu `pending` kabul ediliyor.
- Başvuru sonrası kullanıcı `/dashboard/dietitian/pending` ekranına yönleniyor.

## Admin ve Onay Akışı

Admin tarafı için temel rota ve panel hazırlandı:

```text
src/app/admin-login/page.tsx
src/app/dashboard/admin/page.tsx
```

Admin panelinde diyetisyen başvurularını listeleme fikri kuruldu.

Şu anki durum:

- Başvuru listesi UI seviyesinde hazır.
- Onay/reddetme butonlarının kalıcı DB update akışı henüz tamamlanmadı.
- Gerçek onay sistemi için service role kullanan server action veya API route eklenmeli.

## Danışan Arayüzü

Danışan tarafı mobil öncelikli olacak şekilde düzenlendi.

Hazırlanan ana ekranlar:

- `/dashboard/client`
- `/dashboard/client/plan`
- `/dashboard/client/menu`
- `/dashboard/client/messages`
- `/dashboard/client/stats`
- `/dashboard/client/subscription`
- `/dashboard/client/dietitian`
- `/dashboard/client/onboarding`

Yapılan arayüz kararları:

- Mobil tarafta alt menü yapısı kullanıldı.
- Masaüstünde daha geniş ve okunabilir danışan düzeni korundu.
- Renk teması diyetetik/sağlık hissine daha yakın olacak şekilde yeşil ağırlıklı hale getirildi.
- Kullanıcıya sunum veya ödev diliyle konuşan metinlerden kaçınıldı.
- Danışan ekranlarında son kullanıcıya dönük, ürün gibi duran bir dil hedeflendi.

## Ölçüm ve Grafik Alanı

Ölçüm takibi daha işlevsel hale getirildi.

Yapılanlar:

- Büyük ölçüm kartı daha özet hale getirildi.
- Çizgi grafik yaklaşımı eklendi.
- Haftalık ölçüm mantığına göre grafik düzenlendi.
- Tarihlerin tam tarih olarak kalabalık görünmesi yerine hafta bazlı ifade edilmesi hedeflendi.
- Grafik altında hafta seçimi mantığı kuruldu.
- Aylık tempo bilgisi tutuldu.
- Yıllık tempo alanı fazla anlamlı olmadığı için kaldırıldı.
- Başlangıç tarihi gösterimi istendiği şekilde plana dahil edildi.
- Yanlış ölçümü aynı hafta içinde düzeltme fikri provider akışına eklendi.
- Ölçüm için haftada bir kayıt mantığı tasarlandı.
- Sınır değer fikri eklendi; yanlış veya uç değerlerin kontrol edilmesi hedeflendi.

Not: Grafik tarafında build sırasında Recharts genişlik/yükseklik uyarısı görülebiliyor. Bu uyarı grafik konteyner ölçüsünden kaynaklanıyor ve ayrıca ele alınmalı.

## Menü ve Beslenme Planı

Danışan tarafında menü ve plan ayrımı daha net hale getirildi.

Yapılanlar:

- Özet ekranda plan daha kısa tutuldu.
- Detaylı denge planı ayrı menüden ulaşılacak şekilde konumlandırıldı.
- Diyet menüsü ayrı sayfa olarak kurgulandı.
- Yemek içerikleri, malzemeler ve besin değerleri gösterimi planlandı.
- Menü sayfasında protein, vitamin, mineral, sodyum, kalsiyum gibi değerlerin yer alması hedeflendi.
- Diyetisyen tarafında plan ve menü düzenleme bileşenleri oluşturuldu.

İlgili dosyalar:

```text
src/app/dashboard/client/plan/page.tsx
src/app/dashboard/client/menu/page.tsx
src/app/dashboard/dietitian/plan-editor.tsx
src/app/dashboard/dietitian/menu-editor.tsx
src/app/dashboard/dietitian/plans/page.tsx
```

## Mesajlaşma ve Hatırlatmalar

Mesajlaşma ekranları eklendi.

İlgili ekranlar:

```text
src/app/dashboard/client/messages/page.tsx
src/app/dashboard/dietitian/messages/page.tsx
```

Provider tarafında mesaj ve hatırlatma fonksiyonları hazırlandı:

- Danışanın diyetisyene mesaj göndermesi
- Diyetisyenin danışana mesaj göndermesi
- Diyetisyenin bireysel veya toplu hatırlatma göndermesi
- Su içme ve öğün hatırlatma gibi bildirim mantığı

Supabase tablolarıyla bağlantı kurulan alanlar:

- `messages`
- `notifications`

## Abonelik Akışı

Gerçek ödeme yerine sahte abonelik yönetimi yaklaşımı seçildi.

Hazırlanan rota:

```text
src/app/dashboard/client/subscription/page.tsx
```

Provider içinde abonelik planı güncelleme fonksiyonu eklendi:

```text
updateSubscription
```

Abonelik tarafında hedef:

- Stripe entegrasyonu olmadan demo/premium hissi vermek.
- Türkiye Stripe kullanılabilirliği sorununa takılmadan proje akışını göstermek.
- Ücretsiz, temel ve premium gibi planları uygulama içinde simüle etmek.

## Diyetisyen Paneli

Diyetisyen tarafı masaüstü deneyim öncelikli olacak şekilde geniş panel yapısına oturtuldu.

Hazırlanan ana ekranlar:

- `/dashboard/dietitian`
- `/dashboard/dietitian/clients`
- `/dashboard/dietitian/plans`
- `/dashboard/dietitian/appointments`
- `/dashboard/dietitian/messages`
- `/dashboard/dietitian/profile`
- `/dashboard/dietitian/pending`

Temel işlevler:

- Danışan listesi
- Danışan odak ve hedef notu düzenleme
- Plan düzenleme
- Menü düzenleme
- Randevu takibi
- Mesajlaşma
- Onay bekleyen diyetisyen ekranı

## Login Güncellemesi

Login ekranı yeniden düzenlendi.

İlgili dosya:

```text
src/app/(auth)/login/page.tsx
```

Yapılanlar:

- Önceki daha sade login hissine geri yaklaştırıldı.
- Türkçe karakterleri bozuk görünen metinler temizlendi.
- Demo hesap butonları korundu.
- Danışan demo hesabı ve diyetisyen demo hesabı ayrıldı.
- Alt alana danışan kaydı linki eklendi.
- Alt alana şu diyetisyen başvuru linki eklendi:

```text
Diyetisyen misiniz? Diyetisyen başvurusu yapın
```

Bu link şu rotaya gider:

```text
/register/dietitian
```

Detaylı login notu ayrıca tutuluyor:

```text
LOGIN_GUNCELLEME_RAPORU.md
```

## Proje Dokümantasyonu

Oluşturulan veya güncellenen dokümantasyon dosyaları:

- `PROJE_DURUMU.md`
- `DATABASE_SETUP.md`
- `LOGIN_GUNCELLEME_RAPORU.md`
- `GENEL_GELISTIRME_RAPORU.md`

Bu dosya en genel rapor olarak bırakıldı.

## Doğrulama

Son çalıştırılan build:

```powershell
npm run build
```

Sonuç:

```text
Build başarılı.
```

Login HTTP kontrolü:

```text
http://localhost:3000/login
```

Sonuç:

```text
STATUS=200
LINK_TEXT_FOUND
LOGIN_TEXT_FOUND
```

Daha önce `npm run lint` denendiğinde farklı sayfalardan gelen mevcut ESLint uyarı/hataları görüldü. Bu hatalar login değişikliğinden bağımsız ve ayrıca temizlenmeli.

## Bilinen Açık Noktalar

- Supabase schema henüz DB şifresi olmadan uzaktaki veritabanına uygulanamaz.
- Schema uygulandıktan sonra provider tarafı `profiles`, `clients`, `dietitians`, `dietitian_applications` tablolarını ana kaynak olarak kullanacak şekilde netleştirilmeli.
- Admin onay/reddet akışı gerçek DB update ile bağlanmalı.
- Diyetisyen belge yükleme alanı Supabase Storage ile gerçek dosya upload yapacak hale getirilmeli.
- Bazı eski sayfalarda Türkçe karakter bozulmaları hâlâ olabilir; login dosyası temizlendi ama tüm proje ayrıca taranmalı.
- Recharts grafik uyarısı ayrı bir UI düzeltmesi olarak ele alınmalı.
- Lint hataları toplu şekilde temizlenmeli.
- Demo seed verileri zamanla gerçek Supabase tablolarına taşınmalı.

## Sonraki Mantıklı Sıra

1. Supabase schema'yı `npm run db:push` veya `npm run db:apply:psql` ile uygulamak.
2. Provider'ı `users` fallback yerine `profiles` tablosuna geçirmek.
3. Diyetisyen başvuru formuna gerçek belge upload eklemek.
4. Admin panelinden başvuruyu onaylama/reddetme işlemini kalıcı hale getirmek.
5. Kalan Türkçe karakter ve lint sorunlarını temizlemek.

