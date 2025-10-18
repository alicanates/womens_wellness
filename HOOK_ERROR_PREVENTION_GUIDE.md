# React Hook Hata Önleme Rehberi

## 🎯 "Rendered fewer hooks than expected" Hatasını Önleme

Bu rehber, React Hook kurallarını ihlal etmekten kaynaklanan hataları önlemek için hazırlanmıştır.

## 📋 Kurulum

### 1. ESLint ve Hook Plugin'ini Yükleyin

```bash
cd apps/mobile
pnpm install -D eslint eslint-config-expo eslint-config-prettier eslint-plugin-react-hooks prettier
```

### 2. Konfigürasyon Dosyaları

Aşağıdaki dosyalar projenize eklenmiştir:

- ✅ `apps/mobile/.eslintrc.js` - ESLint konfigürasyonu
- ✅ `apps/mobile/.prettierrc.js` - Prettier konfigürasyonu

### 3. VS Code Ayarları (Opsiyonel)

`.vscode/settings.json` dosyanıza ekleyin:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 🚫 Hook Kuralları - YAPMAYIN

### ❌ 1. Erken Return + Hook Kullanımı

```typescript
// ❌ YANLIŞ
export default function Screen() {
  const [fontsLoaded] = useFonts(...);
  
  if (!fontsLoaded) return null; // ❌ Erken return
  
  const nav = useNavigation(); // ❌ Bu hook bazen çağrılmıyor
  useEffect(...); // ❌ Bu hook bazen çağrılmıyor
  
  return <UI/>;
}
```

### ❌ 2. Koşullu Hook Çağrımı

```typescript
// ❌ YANLIŞ
export default function Screen() {
  if (user) {
    const nav = useNavigation(); // ❌ Hook koşul içinde
  }
  
  return <UI/>;
}
```

### ❌ 3. Loop İçinde Hook

```typescript
// ❌ YANLIŞ
export default function Screen() {
  items.forEach(() => {
    useEffect(...); // ❌ Hook loop içinde
  });
  
  return <UI/>;
}
```

### ❌ 4. Try-Catch İçinde Hook

```typescript
// ❌ YANLIŞ
export default function Screen() {
  try {
    const data = useMemo(...); // ❌ Hook try-catch içinde
  } catch {}
  
  return <UI/>;
}
```

### ❌ 5. Redirect Guard + Hook

```typescript
// ❌ YANLIŞ
export default function Screen() {
  if (!user) return <Redirect href="/login" />; // ❌ Erken return
  
  const nav = useNavigation(); // ❌ Bu hook bazen çağrılmıyor
  
  return <UI/>;
}
```

## ✅ Hook Kuralları - YAPIN

### ✅ 1. Tüm Hook'lar En Üstte

```typescript
// ✅ DOĞRU
export default function Screen() {
  // 1. Tüm hook'ları en üstte çağır
  const [fontsLoaded] = useFonts(...);
  const nav = useNavigation();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 2. Koşullu render en sonda
  if (!fontsLoaded) {
    return <Splash/>;
  }
  
  return <UI/>;
}
```

### ✅ 2. Gate Pattern

```typescript
// ✅ DOĞRU - Component'i ikiye böl
function ScreenGate() {
  const [ready] = useFonts(...);
  
  return ready ? <ScreenInner/> : <Splash/>;
}

function ScreenInner() {
  // Tüm hook'lar burada, her zaman aynı sırada
  const nav = useNavigation();
  useEffect(...);
  
  return <UI/>;
}
```

### ✅ 3. Redirect useEffect İçinde

```typescript
// ✅ DOĞRU
export default function Screen() {
  // 1. Tüm hook'lar en üstte
  const router = useRouter();
  const { user } = useAuthStore();
  
  // 2. Redirect useEffect içinde
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);
  
  // 3. Koşullu render
  if (!user) {
    return <Loading/>;
  }
  
  return <App/>;
}
```

### ✅ 4. Stable Enabled Flag

```typescript
// ✅ DOĞRU - Query hook'ları için
export default function Screen() {
  const { id } = useParams();
  
  // Stable boolean oluştur
  const hasValidId = typeof id === 'string' && id.length > 0;
  const questionId = hasValidId ? id : 'INVALID_ID';
  
  // Stable enabled flag kullan
  const { data } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => fetchQuestion(questionId),
    enabled: hasValidId, // ✅ Stable boolean
  });
  
  if (!hasValidId) {
    return <Error/>;
  }
  
  return <UI data={data}/>;
}
```

### ✅ 5. Derived State Hook'lardan Sonra

```typescript
// ✅ DOĞRU
export default function Screen() {
  // 1. Tüm hook'lar
  const { data, isLoading, isError } = useQuery(...);
  const [filter, setFilter] = useState('all');
  
  // 2. Derived state
  const showLoading = isLoading && !data;
  const showError = isError && !data;
  const filteredData = useMemo(() => {
    return data?.filter(item => item.type === filter);
  }, [data, filter]);
  
  // 3. Koşullu render
  if (showLoading) return <Loading/>;
  if (showError) return <Error/>;
  
  return <UI data={filteredData}/>;
}
```

## 🎓 Best Practice Örnekler

### Örnek 1: Loading State ile Screen

```typescript
export default function ProfileScreen() {
  // ✅ 1. Tüm hook'lar en üstte, koşulsuz
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user?.id),
    enabled: !!user?.id,
  });
  
  const updateMutation = useMutation({
    mutationFn: updateProfile,
  });
  
  // ✅ 2. Derived state
  const showLoading = isLoading && !profile;
  
  // ✅ 3. Koşullu render en sonda
  if (showLoading) {
    return (
      <SafeAreaView>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView>
      <ProfileContent 
        profile={profile}
        editing={editing}
        onEdit={() => setEditing(true)}
      />
    </SafeAreaView>
  );
}
```

### Örnek 2: Auth Guard

```typescript
export default function ProtectedScreen() {
  // ✅ 1. Tüm hook'lar en üstte
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [ready, setReady] = useState(false);
  
  // ✅ 2. Redirect useEffect içinde
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setReady(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  // ✅ 3. Koşullu render
  if (isLoading || !ready) {
    return <Loading/>;
  }
  
  return <ProtectedContent/>;
}
```

### Örnek 3: Dynamic Route

```typescript
export default function QuestionDetailScreen() {
  // ✅ 1. Tüm hook'lar en üstte
  const { id } = useParams();
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  
  // ✅ 2. Stable enabled flag
  const hasValidId = typeof id === 'string' && id.length > 0;
  const questionId = hasValidId ? id : 'INVALID_ID';
  
  const { data: question, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => fetchQuestion(questionId),
    enabled: hasValidId,
  });
  
  const { data: answers } = useQuery({
    queryKey: ['answers', questionId],
    queryFn: () => fetchAnswers(questionId),
    enabled: hasValidId,
  });
  
  // ✅ 3. Tüm mutation'lar koşulsuz
  const createAnswer = useMutation({
    mutationFn: createAnswerFn,
  });
  
  // ✅ 4. Derived state
  const isAuthor = question?.userId === user?.id;
  
  // ✅ 5. Koşullu render en sonda
  if (!hasValidId) {
    return <NotFound/>;
  }
  
  if (isLoading) {
    return <Loading/>;
  }
  
  if (!question) {
    return <Error/>;
  }
  
  return (
    <QuestionDetail
      question={question}
      answers={answers}
      isAuthor={isAuthor}
      showComments={showComments}
      onToggleComments={() => setShowComments(!showComments)}
    />
  );
}
```

## 🔧 Hata Ayıklama

### Hata Mesajı Alıyorsanız

1. **Metro cache'i temizleyin:**
   ```bash
   cd apps/mobile
   npx expo start -c
   ```

2. **Node modules'ü yeniden yükleyin:**
   ```bash
   cd apps/mobile
   rm -rf node_modules
   pnpm install
   ```

3. **ESLint çalıştırın:**
   ```bash
   cd apps/mobile
   pnpm lint
   ```

4. **Spesifik dosyayı kontrol edin:**
   - Hata mesajındaki stack trace'e bakın
   - Hangi component'te hata oluştuğunu bulun
   - O component'teki tüm hook çağrılarını kontrol edin

### Checklist

- [ ] Tüm hook'lar component'in en üstünde mi?
- [ ] Hiçbir hook koşul içinde değil mi?
- [ ] Hiçbir hook loop içinde değil mi?
- [ ] Hiçbir hook try-catch içinde değil mi?
- [ ] Erken return'ler hook'lardan sonra mı?
- [ ] Query hook'ları stable enabled flag kullanıyor mu?
- [ ] ESLint hook kuralları aktif mi?

## 📚 Kaynaklar

- [React Hook Kuralları](https://react.dev/reference/rules/rules-of-hooks)
- [ESLint Plugin React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)

---

**Not:** Bu rehber, projenizde bulunan tüm dosyaların analizi sonucunda hazırlanmıştır. Mevcut kodunuz zaten hook kurallarına uygun durumda. Bu rehber, gelecekte yeni component'ler yazarken referans olması için hazırlanmıştır.
