# Login Güncelleme Raporu

Tarih: 25 Nisan 2026

Bu not, login ekranı üzerinde bu turda yapılan değişiklikleri ve doğrulama sonucunu kaydetmek için oluşturuldu.

## Hedef

Login arayüzü daha önceki daha sade ve ürün odaklı hisse geri yaklaştırıldı. Mevcut Supabase Auth ve rol bazlı yönlendirme mantığı korunarak, ekranın altına diyetisyen başvurusu için ayrı bir link eklendi.

## Değişen Dosyalar

- `src/app/(auth)/login/page.tsx`
- `LOGIN_GUNCELLEME_RAPORU.md`

## Yapılan Arayüz Değişiklikleri

- Login sayfası yeniden düzenlendi.
- Tam ekran iki bölümlü yapı korundu, ancak daha yumuşak ve temiz bir Health Corner görünümü verildi.
- Sol tarafta marka, kısa değer metni ve uygulama kullanımına dair güven veren maddeler yer alıyor.
- Sağ tarafta giriş formu, demo hesap seçimleri ve hesap oluşturma linkleri daha okunabilir bir sıraya alındı.
- Mobilde sol tanıtım alanı gizleniyor; giriş formu tek kolon olarak çalışıyor.
- Form alanları daha belirgin hale getirildi:
  - E-posta alanı
  - Şifre alanı
  - Oturum aç butonu
  - Hata mesajı kutusu
- Demo hesap butonları korunarak ayrıldı:
  - Danışan demo hesabı: `zeynep@example.com`
  - Diyetisyen demo hesabı: `elif@healthcorner.demo`

## Eklenen Başvuru Linki

Login ekranının altına şu akış eklendi:

```text
Diyetisyen misiniz? Diyetisyen başvurusu yapın
```

Bu link doğrudan şu rotaya gider:

```text
/register/dietitian
```

Normal danışan kaydı için ayrı link de korundu:

```text
/register/client
```

## Korunan Davranışlar

- Giriş sonrası kullanıcı rolü yine `login()` sonucundan okunuyor.
- Danışan kullanıcı `/dashboard/client` rotasına gider.
- Diyetisyen kullanıcı aktifse `/dashboard/dietitian` rotasına gider.
- Diyetisyen kullanıcı beklemedeyse `/dashboard/dietitian/pending` rotasına gider.
- Admin kullanıcı `/dashboard/admin` rotasına gider.
- Demo hesap butonları sadece formu doldurur; otomatik giriş yapmaz. Kullanıcı yine `Oturum aç` butonuna basar.

## Türkçe Metin Temizliği

Login dosyasındaki bozuk karakterli metinler temizlendi. Kullanıcıya görünen metinlerde doğru Türkçe karakterler kullanıldı:

- Giriş yap
- E-posta
- Şifre
- Giriş yapılıyor...
- Oturum aç
- Danışan
- Diyetisyen
- Diyetisyen başvurusu yapın

## Doğrulama

Çalıştırılan kontrol:

```powershell
npm run build
```

Sonuç:

```text
Build başarılı.
```

Ek HTTP kontrolü:

```powershell
http://localhost:3000/login
```

Sonuç:

```text
STATUS=200
LINK_TEXT_FOUND
LOGIN_TEXT_FOUND
```

Not: Build sırasında mevcut grafik bileşeninden gelen Recharts genişlik/yükseklik uyarısı göründü. Bu uyarı login değişikliğiyle ilgili değil.

## Sıradaki Mantıklı Adım

Login ekranı artık daha temiz. Bir sonraki adımda auth tarafındaki asıl tablo modeli Supabase schema uygulandıktan sonra `profiles`, `clients`, `dietitians` ve `dietitian_applications` tablolarına bağlanmalı. Böylece demo metadata fallback'i yerine gerçek hesap modeli kullanılır.

