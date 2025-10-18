# QnA Security Implementation

## Overview

Bu doküman, Q&A Community modülü için implement edilen güvenlik özelliklerini açıklar.

## Implemented Features

### 1. Rate Limiting

Her endpoint için özel rate limit'ler uygulandı:

#### Questions
- **POST /api/qna/questions**: 5 soru/saat
- **PATCH /api/qna/questions/:id**: 10 güncelleme/saat
- **DELETE /api/qna/questions/:id**: 10 silme/saat
- **POST /api/qna/questions/:id/favorite**: 30 favorileme/saat
- **DELETE /api/qna/questions/:id/favorite**: 30 favoriden çıkarma/saat
- **POST /api/qna/questions/:id/follow**: 30 takip/saat
- **DELETE /api/qna/questions/:id/follow**: 30 takipten çıkma/saat

#### Answers
- **POST /api/qna/questions/:questionId/answers**: 10 cevap/saat
- **PATCH /api/qna/answers/:id**: 20 güncelleme/saat
- **DELETE /api/qna/answers/:id**: 10 silme/saat
- **POST /api/qna/questions/:questionId/answers/:answerId/mark-best**: 20 işaretleme/saat

#### Votes
- **POST /api/qna/answers/:id/vote**: 50 oy/saat
- **DELETE /api/qna/answers/:id/vote**: 50 oy geri çekme/saat

#### Comments
- **POST /api/qna/questions/:id/comments**: 20 yorum/saat
- **POST /api/qna/answers/:id/comments**: 20 yorum/saat
- **DELETE /api/qna/comments/question/:id**: 20 silme/saat
- **DELETE /api/qna/comments/answer/:id**: 20 silme/saat

#### Interactions
- **POST /api/qna/users/:id/follow**: 20 takip/saat
- **DELETE /api/qna/users/:id/follow**: 20 takipten çıkma/saat

#### Moderation
- **POST /api/qna/moderation/report**: 10 rapor/saat
- **PATCH /api/qna/moderation/reports/:id**: 50 inceleme/saat (admin)
- **POST /api/qna/moderation/hide/:contentType/:id**: 100 gizleme/saat (admin)
- **DELETE /api/qna/moderation/content/:contentType/:id**: 100 silme/saat (admin)

### 2. Permission Guards

#### OwnerGuard
Kullanıcının sadece kendi içeriğini düzenleyip silebilmesini sağlar.

**Desteklenen Kaynaklar:**
- Question
- Answer
- QuestionComment
- AnswerComment

**Kullanım:**
```typescript
@Patch(':id')
@UseGuards(OwnerGuard)
async updateQuestion(@Request() req, @Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    // Sadece soru sahibi güncelleyebilir
}
```

#### QuestionOwnerGuard
Sadece soru sahibinin en iyi cevabı seçebilmesini sağlar.

**Kullanım:**
```typescript
@Post('questions/:questionId/answers/:answerId/mark-best')
@UseGuards(QuestionOwnerGuard)
async markBestAnswer(@Request() req, @Param('questionId') questionId: string) {
    // Sadece soru sahibi en iyi cevabı seçebilir
}
```

#### AdminGuard
Sadece admin kullanıcıların moderasyon işlemlerini yapabilmesini sağlar.

**Kullanım:**
```typescript
@Get('reports')
@UseGuards(AdminGuard)
async getReports() {
    // Sadece admin'ler raporları görebilir
}
```

### 3. Input Sanitization

#### SanitizePipe
Tüm kullanıcı girdilerini sanitize eder ve XSS saldırılarını önler.

**Özellikler:**
- HTML tag'lerini kaldırır
- Script tag'lerini ve içeriğini temizler
- Event handler'ları kaldırır
- javascript: ve data: protokollerini engeller
- Whitespace'leri normalize eder

**Kullanım:**
```typescript
@Post()
@UsePipes(new SanitizePipe())
async createQuestion(@Body() dto: CreateQuestionDto) {
    // DTO otomatik olarak sanitize edilir
}
```

#### Sanitization Utilities

**sanitizeHtml(input: string)**
- HTML tag'lerini ve tehlikeli karakterleri kaldırır

**sanitizeContent(content: string)**
- İçeriği sanitize eder
- Minimum 20, maksimum 5000 karakter kontrolü
- Spam tespiti yapar

**sanitizeQuestionTitle(title: string)**
- Başlığı sanitize eder
- Minimum 10, maksimum 200 karakter kontrolü

**sanitizeComment(comment: string)**
- Yorumu sanitize eder
- Minimum 1, maksimum 300 karakter kontrolü

**sanitizeTags(tags: string[])**
- Tag'leri sanitize eder
- Maksimum 5 tag, her biri maksimum 30 karakter

**detectSpam(content: string)**
- Spam pattern'lerini tespit eder:
  - Aşırı URL kullanımı (3+)
  - Aşırı büyük harf (10+)
  - Aşırı noktalama (!?!?!?!)
  - Spam kelimeleri (kazanç, para kazan, tıkla, vb.)
  - Aşırı emoji kullanımı (5+)

### 4. Input Validation

Tüm DTO'larda class-validator kullanılarak validation yapılır:

**CreateQuestionDto:**
```typescript
@IsString()
@IsNotEmpty()
@MinLength(10)
@MaxLength(200)
title: string;

@IsString()
@IsNotEmpty()
@MinLength(20)
@MaxLength(5000)
content: string;

@IsEnum(QuestionCategory)
category: QuestionCategory;

@IsArray()
@IsString({ each: true })
@ArrayMaxSize(5)
@IsOptional()
tags?: string[];
```

**CreateAnswerDto:**
```typescript
@IsString()
@IsNotEmpty()
@MinLength(20)
@MaxLength(5000)
content: string;
```

**CreateCommentDto:**
```typescript
@IsString()
@IsNotEmpty()
@MinLength(1)
@MaxLength(300)
content: string;
```

**VoteDto:**
```typescript
@IsEnum(VoteType)
voteType: VoteType;
```

### 5. Security Best Practices

#### ID Validation
Tüm endpoint'lerde ID validation yapılır:
```typescript
if (!id || id.length < 10) {
    throw new BadRequestException('Geçersiz ID');
}
```

#### Authentication
Tüm endpoint'ler JWT authentication gerektirir:
```typescript
@Controller('qna/questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionsController { }
```

#### Error Handling
Güvenlik açısından hassas bilgiler error mesajlarında paylaşılmaz:
```typescript
if (!question) {
    throw new NotFoundException('Soru bulunamadı');
}

if (question.userId !== userId) {
    throw new ForbiddenException('Bu işlem için yetkiniz yok');
}
```

## Testing

### Rate Limiting Test
```bash
# 5 soru oluştur (başarılı)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/qna/questions \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Question '$i'","content":"Test content...","category":"GENERAL"}'
done

# 6. soru (rate limit hatası almalı)
curl -X POST http://localhost:3000/api/qna/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Question 6","content":"Test content...","category":"GENERAL"}'
```

### Permission Guard Test
```bash
# Başka kullanıcının sorusunu güncellemeye çalış (403 hatası almalı)
curl -X PATCH http://localhost:3000/api/qna/questions/$OTHER_USER_QUESTION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

### XSS Protection Test
```bash
# XSS payload gönder (sanitize edilmeli)
curl -X POST http://localhost:3000/api/qna/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"<script>alert(\"XSS\")</script>Test Question",
    "content":"<img src=x onerror=alert(\"XSS\")>Test content...",
    "category":"GENERAL"
  }'
```

### Spam Detection Test
```bash
# Spam içerik gönder (spam hatası almalı)
curl -X POST http://localhost:3000/api/qna/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"PARA KAZAN HEMEN TIKLA!!!",
    "content":"Bedava para kazanmak için hemen tıkla! https://spam.com https://spam2.com https://spam3.com",
    "category":"GENERAL"
  }'
```

## Security Checklist

- [x] Rate limiting tüm endpoint'lerde aktif
- [x] Permission guards (owner, question owner, admin) implement edildi
- [x] Input sanitization (XSS koruması) aktif
- [x] Input validation (class-validator) aktif
- [x] Spam detection implement edildi
- [x] ID validation tüm endpoint'lerde yapılıyor
- [x] JWT authentication zorunlu
- [x] Error handling güvenli
- [x] Admin guard moderasyon endpoint'lerinde aktif
- [x] Owner guard düzenleme/silme endpoint'lerinde aktif

## Future Improvements

1. **CSRF Protection**: Cross-Site Request Forgery koruması eklenebilir
2. **IP-based Rate Limiting**: Kullanıcı ID'ye ek olarak IP bazlı rate limiting
3. **Content Filtering**: Daha gelişmiş spam ve uygunsuz içerik filtreleme
4. **Audit Logging**: Tüm güvenlik olaylarının loglanması
5. **Two-Factor Authentication**: Hassas işlemler için 2FA
6. **Captcha**: Bot koruması için captcha entegrasyonu
7. **Content Security Policy**: CSP header'ları eklenmesi
8. **SQL Injection Protection**: Prisma ORM zaten koruma sağlıyor, ek kontroller eklenebilir

## Requirements Coverage

Bu implementation aşağıdaki requirement'ları karşılar:

- **Tüm Requirements için Security**: Rate limiting, input validation, XSS koruması, permission kontrolü
- **Requirement 1.5**: Validation ve error handling
- **Requirement 2.3**: Anonim mod güvenliği
- **Requirement 4.2**: Sadece soru sahibi en iyi cevabı seçebilir (QuestionOwnerGuard)
- **Requirement 5.4**: Kullanıcı kendi cevabına oy veremez (VoteService'de kontrol)
- **Requirement 8.1-8.5**: Moderasyon güvenliği (AdminGuard)
- **Requirement 10.3-10.5**: Quota kontrolü ve güvenliği

## Conclusion

Q&A Community modülü için kapsamlı güvenlik önlemleri implement edildi. Rate limiting, permission guards, input sanitization ve validation ile platform güvenli hale getirildi.
