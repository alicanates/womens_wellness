import axios from 'axios';

const API_URL = 'http://localhost:4000';

// Test kullanıcıları
const TEST_USERS = {
    user1: {
        email: 'test1@example.com',
        password: 'Test123456!',
    },
    user2: {
        email: 'test2@example.com',
        password: 'Test123456!',
    },
};

let user1Token: string;
let user2Token: string;
let questionId: string;

async function login(email: string, password: string): Promise<string> {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            identifier: email,
            password,
        });
        return response.data.accessToken;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
}

async function createTestQuestion(token: string): Promise<string> {
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions`,
            {
                title: 'Test Soru - Favorileme ve Takip',
                content: 'Bu soru favorileme ve takip özelliklerini test etmek için oluşturuldu.',
                category: 'GENERAL',
                tags: ['test', 'interactions'],
                isAnonymous: false,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Test sorusu oluşturuldu:', response.data.id);
        return response.data.id;
    } catch (error: any) {
        console.error('❌ Soru oluşturma hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testFavoriteQuestion(token: string, qId: string) {
    console.log('\n📌 Test: Soruyu favorilere ekleme');
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions/${qId}/favorite`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Soru favorilere eklendi:', response.data);
    } catch (error: any) {
        console.error('❌ Favorilere ekleme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testUnfavoriteQuestion(token: string, qId: string) {
    console.log('\n📌 Test: Soruyu favorilerden çıkarma');
    try {
        const response = await axios.delete(
            `${API_URL}/qna/questions/${qId}/favorite`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Soru favorilerden çıkarıldı:', response.data);
    } catch (error: any) {
        console.error('❌ Favorilerden çıkarma hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testFollowQuestion(token: string, qId: string) {
    console.log('\n📌 Test: Soruyu takip etme');
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions/${qId}/follow`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Soru takip edildi:', response.data);
    } catch (error: any) {
        console.error('❌ Takip etme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testUnfollowQuestion(token: string, qId: string) {
    console.log('\n📌 Test: Soru takibini bırakma');
    try {
        const response = await axios.delete(
            `${API_URL}/qna/questions/${qId}/follow`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Soru takibi bırakıldı:', response.data);
    } catch (error: any) {
        console.error('❌ Takibi bırakma hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testGetFavoriteQuestions(token: string) {
    console.log('\n📌 Test: Favori soruları listeleme');
    try {
        const response = await axios.get(
            `${API_URL}/qna/questions/favorites`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Favori sorular:', {
            total: response.data.total,
            count: response.data.questions.length,
            questions: response.data.questions.map((q: any) => ({
                id: q.id,
                title: q.title,
                isFavorited: q.isFavorited,
            })),
        });
    } catch (error: any) {
        console.error('❌ Favori sorular listeleme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testGetFollowingQuestions(token: string) {
    console.log('\n📌 Test: Takip edilen soruları listeleme');
    try {
        const response = await axios.get(
            `${API_URL}/qna/questions/following`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Takip edilen sorular:', {
            total: response.data.total,
            count: response.data.questions.length,
            questions: response.data.questions.map((q: any) => ({
                id: q.id,
                title: q.title,
                isFollowing: q.isFollowing,
            })),
        });
    } catch (error: any) {
        console.error('❌ Takip edilen sorular listeleme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testFollowUser(token: string, targetUserId: string) {
    console.log('\n📌 Test: Kullanıcıyı takip etme');
    try {
        const response = await axios.post(
            `${API_URL}/qna/users/${targetUserId}/follow`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Kullanıcı takip edildi:', response.data);
    } catch (error: any) {
        console.error('❌ Kullanıcı takip etme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testUnfollowUser(token: string, targetUserId: string) {
    console.log('\n📌 Test: Kullanıcı takibini bırakma');
    try {
        const response = await axios.delete(
            `${API_URL}/qna/users/${targetUserId}/follow`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Kullanıcı takibi bırakıldı:', response.data);
    } catch (error: any) {
        console.error('❌ Kullanıcı takibi bırakma hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testGetUserFollowers(token: string, userId: string) {
    console.log('\n📌 Test: Kullanıcının takipçilerini listeleme');
    try {
        const response = await axios.get(
            `${API_URL}/qna/users/${userId}/followers`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Takipçiler:', {
            count: response.data.length,
            followers: response.data.map((f: any) => ({
                id: f.id,
                username: f.username,
                followedAt: f.followedAt,
            })),
        });
    } catch (error: any) {
        console.error('❌ Takipçiler listeleme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testGetUserFollowing(token: string, userId: string) {
    console.log('\n📌 Test: Kullanıcının takip ettiklerini listeleme');
    try {
        const response = await axios.get(
            `${API_URL}/qna/users/${userId}/following`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Takip edilenler:', {
            count: response.data.length,
            following: response.data.map((f: any) => ({
                id: f.id,
                username: f.username,
                followedAt: f.followedAt,
            })),
        });
    } catch (error: any) {
        console.error('❌ Takip edilenler listeleme hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function testQuestionInteractionStatus(token: string, qId: string) {
    console.log('\n📌 Test: Soru detayında etkileşim durumu kontrolü');
    try {
        const response = await axios.get(
            `${API_URL}/qna/questions/${qId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('✅ Soru etkileşim durumu:', {
            id: response.data.id,
            title: response.data.title,
            isFavorited: response.data.isFavorited,
            isFollowing: response.data.isFollowing,
            _count: response.data._count,
        });
    } catch (error: any) {
        console.error('❌ Soru detay hatası:', error.response?.data || error.message);
        throw error;
    }
}

async function runTests() {
    console.log('🚀 Favorileme ve Takip Sistemi Test Başlıyor...\n');

    try {
        // Login
        console.log('📝 Kullanıcılar giriş yapıyor...');
        user1Token = await login(TEST_USERS.user1.email, TEST_USERS.user1.password);
        user2Token = await login(TEST_USERS.user2.email, TEST_USERS.user2.password);
        console.log('✅ Kullanıcılar giriş yaptı\n');

        // Create test question
        questionId = await createTestQuestion(user1Token);

        // Get user IDs from tokens (decode JWT)
        const user1Id = JSON.parse(Buffer.from(user1Token.split('.')[1], 'base64').toString()).sub;
        const user2Id = JSON.parse(Buffer.from(user2Token.split('.')[1], 'base64').toString()).sub;

        // Test Question Favorite/Unfavorite
        await testFavoriteQuestion(user2Token, questionId);
        await testGetFavoriteQuestions(user2Token);
        await testQuestionInteractionStatus(user2Token, questionId);
        await testUnfavoriteQuestion(user2Token, questionId);
        await testGetFavoriteQuestions(user2Token);

        // Test Question Follow/Unfollow
        await testFollowQuestion(user2Token, questionId);
        await testGetFollowingQuestions(user2Token);
        await testQuestionInteractionStatus(user2Token, questionId);
        await testUnfollowQuestion(user2Token, questionId);
        await testGetFollowingQuestions(user2Token);

        // Test both favorite and follow together
        console.log('\n📌 Test: Hem favorileme hem takip etme');
        await testFavoriteQuestion(user2Token, questionId);
        await testFollowQuestion(user2Token, questionId);
        await testQuestionInteractionStatus(user2Token, questionId);

        // Test User Follow/Unfollow
        await testFollowUser(user2Token, user1Id);
        await testGetUserFollowers(user1Token, user1Id);
        await testGetUserFollowing(user2Token, user2Id);
        await testUnfollowUser(user2Token, user1Id);
        await testGetUserFollowers(user1Token, user1Id);
        await testGetUserFollowing(user2Token, user2Id);

        // Test self-follow prevention
        console.log('\n📌 Test: Kendini takip etme engelleme');
        try {
            await testFollowUser(user1Token, user1Id);
            console.log('❌ Kendini takip etme engellenmedi!');
        } catch (error: any) {
            if (error.response?.data?.message?.includes('Kendinizi takip edemezsiniz')) {
                console.log('✅ Kendini takip etme başarıyla engellendi');
            } else {
                throw error;
            }
        }

        console.log('\n✅ Tüm testler başarıyla tamamlandı!');
    } catch (error) {
        console.error('\n❌ Test hatası:', error);
        process.exit(1);
    }
}

runTests();
