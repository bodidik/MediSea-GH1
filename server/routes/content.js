import express from 'express';
import Content from '../models/Content.js';

const router = express.Router();

// 1. LİSTELEME MODU (Tüm başlıkları getirir)
router.get('/', async (req, res) => {
  try {
    const { section, locale } = req.query;
    const filter = { status: 'published' }; 

    if (section) filter.section = section;
    if (locale) filter.locale = locale;

    const topics = await Content.find(filter)
      .select('title slug section')
      .sort({ title: 1 });

    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Liste alınamadı' });
  }
});

// 2. TEKLİ İÇERİK MODU (Detay getirir - Editör için gerekli)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await Content.findOne({ slug });
    
    if (!content) return res.status(404).json({ message: 'Bulunamadı' });
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// 3. SİLME MODU (DELETE)
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("🔥 Silme isteği geldi:", slug);

    const result = await Content.deleteOne({ slug: slug });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Silinecek kayıt bulunamadı." });
    }

    res.json({ success: true, message: "Kayıt silindi." });
  } catch (error) {
    console.error("🚨 Silme hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. GÜNCELLEME MODU (PUT) - İŞTE EKSİK OLAN PARÇA BU!
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body; // Editörden gelen { title, summary, sections... } paketi

    console.log("📝 Güncelleme isteği:", slug);

    // Veriyi bul ve değiştir
    // { new: true } -> Bize eski halini değil, güncellenmiş halini döndürür.
    const updatedContent = await Content.findOneAndUpdate(
      { slug: slug },
      updateData,
      { new: true } 
    );

    if (!updatedContent) {
      return res.status(404).json({ message: "Güncellenecek kayıt bulunamadı." });
    }

    console.log("✅ Başarıyla güncellendi.");
    res.json(updatedContent);

  } catch (error) {
    console.error("🚨 Güncelleme hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;