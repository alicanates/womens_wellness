'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Switch, DatePicker, Divider } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const CATEGORIES = [
    { value: 'menstrual_health', label: '🩸 Regl Sağlığı' },
    { value: 'pregnancy', label: '🤰 Hamilelik' },
    { value: 'fertility', label: '💕 Doğurganlık' },
    { value: 'nutrition', label: '🥗 Beslenme' },
    { value: 'exercise', label: '💪 Egzersiz' },
    { value: 'mental_health', label: '🧠 Ruh Sağlığı' },
    { value: 'sleep', label: '😴 Uyku' },
    { value: 'hydration', label: '💧 Hidrasyon' },
    { value: 'contraception', label: '💊 Doğum Kontrolü' },
    { value: 'pms', label: '🌙 PMS' },
    { value: 'menopause', label: '🌸 Menopoz' },
    { value: 'sexual_health', label: '❤️ Cinsel Sağlık' },
];

export default function ArticleCreate() {
    const { formProps, saveButtonProps } = useForm({
        resource: 'content/articles',
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Divider orientation="left">Temel Bilgiler</Divider>

                <Form.Item
                    label="Başlık (Türkçe)"
                    name="titleTr"
                    rules={[{ required: true, message: 'Türkçe başlık zorunludur' }]}
                >
                    <Input placeholder="Örn: Regl Döngüsü Hakkında Bilmeniz Gerekenler" />
                </Form.Item>

                <Form.Item label="Başlık (İngilizce)" name="titleEn">
                    <Input placeholder="Örn: What You Need to Know About Menstrual Cycle" />
                </Form.Item>

                <Form.Item label="Özet" name="excerpt">
                    <TextArea
                        rows={3}
                        placeholder="Makalenin kısa özeti (kartlarda gösterilecek)"
                        showCount
                        maxLength={200}
                    />
                </Form.Item>

                <Divider orientation="left">İçerik</Divider>

                <Form.Item
                    label="İçerik (Türkçe)"
                    name="contentTr"
                    rules={[{ required: true, message: 'Türkçe içerik zorunludur' }]}
                    tooltip="Markdown formatı desteklenir"
                >
                    <TextArea
                        rows={15}
                        placeholder="Markdown formatında yazabilirsiniz..."
                    />
                </Form.Item>

                <Form.Item
                    label="İçerik (İngilizce)"
                    name="contentEn"
                    tooltip="Markdown formatı desteklenir"
                >
                    <TextArea
                        rows={15}
                        placeholder="You can write in Markdown format..."
                    />
                </Form.Item>

                <Divider orientation="left">Kategorilendirme</Divider>

                <Form.Item
                    label="Kategori"
                    name="category"
                    rules={[{ required: true, message: 'Kategori seçiniz' }]}
                >
                    <Select placeholder="Kategori seçin">
                        {CATEGORIES.map((cat) => (
                            <Select.Option key={cat.value} value={cat.value}>
                                {cat.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Etiketler" name="tags" tooltip="Enter ile yeni etiket ekleyin">
                    <Select
                        mode="tags"
                        placeholder="hamilelik, beslenme, sağlık..."
                    />
                </Form.Item>

                <Divider orientation="left">Görseller</Divider>

                <Form.Item
                    label="Görsel URL"
                    name="imageUrl"
                    tooltip="Makale detay sayfasında gösterilecek büyük görsel"
                >
                    <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>

                <Form.Item
                    label="Küçük Görsel URL"
                    name="thumbnailUrl"
                    tooltip="Liste ve kartlarda gösterilecek küçük görsel"
                >
                    <Input placeholder="https://example.com/thumbnail.jpg" />
                </Form.Item>

                <Divider orientation="left">Meta Bilgiler</Divider>

                <Form.Item label="Yazar" name="author">
                    <Input placeholder="Dr. Ayşe Yılmaz" />
                </Form.Item>

                <Form.Item
                    label="Okuma Süresi (dakika)"
                    name="readTimeMin"
                    initialValue={5}
                >
                    <InputNumber min={1} max={60} />
                </Form.Item>

                <Form.Item
                    label="Öncelik"
                    name="priority"
                    initialValue={0}
                    tooltip="Yüksek öncelikli makaleler önce gösterilir"
                >
                    <InputNumber min={0} max={100} />
                </Form.Item>

                <Divider orientation="left">Yayın Ayarları</Divider>

                <Form.Item
                    label="Aktif"
                    name="isActive"
                    valuePropName="checked"
                    initialValue={true}
                    tooltip="Pasif makaleler kullanıcılara gösterilmez"
                >
                    <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                </Form.Item>

                <Form.Item
                    label="Yayın Tarihi"
                    name="publishedAt"
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : dayjs(),
                    })}
                    normalize={(value) => value && value.toISOString()}
                >
                    <DatePicker
                        showTime
                        format="DD.MM.YYYY HH:mm"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    label="Son Kullanma Tarihi"
                    name="expiresAt"
                    tooltip="Bu tarihten sonra makale otomatik olarak gizlenir (opsiyonel)"
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : undefined,
                    })}
                    normalize={(value) => value && value.toISOString()}
                >
                    <DatePicker
                        showTime
                        format="DD.MM.YYYY HH:mm"
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Create>
    );
}
