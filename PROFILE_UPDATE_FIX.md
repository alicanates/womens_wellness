# Profil Güncelleme Sorunu Düzeltmesi

## Sorun
Ayarlar sayfasında profil düzenlemesi yapıldığında, değişiklikler kaydediliyordu ancak ana sayfaya dönüldüğünde profil bilgileri sıfırlanmış gibi görünüyordu.

## Kök Neden
1. **API Endpoint Tutarsızlığı**: Frontend'de bazı yerlerde `/users/me`, bazı yerlerde `/me` endpoint'i kullanılıyordu
2. **React Query Cache Yönetimi**: Profil güncellemelerinden sonra cache düzgün invalidate edilmiyordu
3. **AuthStore Senkronizasyonu**: AuthStore ve SecureStore güncellenmiyor, sadece React Query cache'i güncellenmişti
4. **Home Snapshot Cache**: Ana sayfa ayrı bir `homeSnapshot` query'si kullanıyordu ve bu invalidate edilmiyordu

## Yapılan Düzeltmeler

### 1. API Endpoint Tutarlılığı
**Dosya**: `apps/mobile/src/services/api.ts`
- `userService.getMe()` endpoint'ini `/users/me` yerine `/me` olarak değiştirildi
- Backend'de her iki endpoint de destekleniyor ama tutarlılık için `/me` kullanılıyor

**Dosya**: `apps/mobile/src/store/authStore.ts`
- Token validation sırasında kullanılan endpoint `/users/me` yerine `/me` olarak değiştirildi

### 2. React Query Cache Yönetimi İyileştirildi
**Dosya**: `apps/mobile/app/settings.tsx`

#### Profil Güncelleme Mutation
```typescript
const updateProfileMutation = useMutation({
  mutationFn: (data: any) => userService.updateMe(data),
  onSuccess: async (updatedData) => {
    // 1. Direkt cache'i güncelle (immediate update)
    queryClient.setQueryData(['me'], updatedData);
    
    // 2. İlgili tüm query'leri invalidate et
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

    // 3. AuthStore'u güncelle
    if (user && updatedData) {
      const updatedUser = {
        ...user,
        email: (updatedData as any).email,
        username: (updatedData as any).username,
        profile: (updatedData as any).profile,
      };
      useAuthStore.setState({ user: updatedUser });
      
      // 4. SecureStore'u da güncelle (persistence)
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    }
  },
});
```

#### Query Konfigürasyonu
```typescript
const { data: userData, isLoading, refetch } = useQuery({
  queryKey: ['me'],
  queryFn: () => userService.getMe(),
  staleTime: 0, // Her zaman stale kabul et
  refetchOnMount: 'always', // Her mount'ta refetch
  refetchOnWindowFocus: true, // Focus'ta refetch
});
```

### 3. Profil Fotoğrafı Güncellemeleri
Profil fotoğrafı yükleme, silme ve değiştirme işlemlerinde de aynı pattern uygulandı:
- Cache invalidation (hem `me` hem `homeSnapshot`)
- AuthStore güncelleme
- SecureStore persistence

### 4. Username Güncellemesi
Username değişikliklerinde de aynı senkronizasyon sağlandı:
```typescript
const usernameResponse = await userService.updateUsername(normalizedUsername);

// Cache'i güncelle
queryClient.setQueryData(['me'], usernameResponse);
await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

// AuthStore ve SecureStore'u güncelle
if (user) {
  const updatedUser = {
    ...user,
    username: (usernameResponse as any).username,
    profile: (usernameResponse as any).profile,
  };
  useAuthStore.setState({ user: updatedUser });
  await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
}
```

## Sonuç
Artık profil güncellemeleri yapıldığında:
1. ✅ Değişiklikler anında görünür (setQueryData)
2. ✅ Ana sayfaya dönüldüğünde güncel veriler gösterilir (homeSnapshot invalidation)
3. ✅ Uygulama yeniden başlatıldığında veriler korunur (SecureStore persistence)
4. ✅ Tüm ekranlarda tutarlı veri gösterilir (AuthStore sync)

## Test Senaryoları
1. ✅ Profil bilgilerini düzenle ve kaydet → Ayarlar sayfasında güncel veriler görünmeli
2. ✅ Ana sayfaya dön → Güncel isim ve profil fotoğrafı görünmeli
3. ✅ Uygulamayı kapat ve tekrar aç → Değişiklikler korunmuş olmalı
4. ✅ Profil fotoğrafı değiştir → Hem ayarlarda hem ana sayfada güncel fotoğraf görünmeli
5. ✅ Username değiştir → Tüm ekranlarda yeni username görünmeli
