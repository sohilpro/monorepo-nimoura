/**
 * Seed script for the featured Nimoura Beauty Magazine article:
 * «فرق تینت لب و شیدینگ لب چیست؟ کدام بهتر است؟»
 *
 * Can be run via:
 *   npm run seed:magazine
 *   or from apps/api:
 *   npm run seed:magazine
 */
import { DataSource } from 'typeorm';
import dataSource from '../src/common/database/data-source';
import { Article, ArticleStatus } from '../src/modules/magazine/entities/articles.entity';
import { Author } from '../src/modules/magazine/entities/author.entity';
import { Category } from '../src/modules/magazine/entities/category.entity';
import { Tag } from '../src/modules/magazine/entities/tag.entity';
import { Products } from '../src/modules/products/entities/products.entity';

export async function seed(ds: DataSource): Promise<void> {
  const articleRepo = ds.getRepository(Article);
  const authorRepo = ds.getRepository(Author);
  const categoryRepo = ds.getRepository(Category);
  const tagRepo = ds.getRepository(Tag);
  const productRepo = ds.getRepository(Products);

  console.log('🌱 شروع سید مقاله مجله زیبایی نیمورا...');

  // ۱. ایجاد یا دریافت دسته‌بندی
  let category = await categoryRepo.findOneBy({ slug: 'lip-makeup-and-care' });
  if (!category) {
    category = categoryRepo.create({
      name: 'آرایش و مراقبت لب',
      slug: 'lip-makeup-and-care',
      description: 'راهنماهای جامع آرایش لب، مقایسه تینت و رژلب، و تکنیک‌های مراقبت از سلامت لب‌ها',
      icon: 'pi-heart',
    });
    category = await categoryRepo.save(category);
    console.log('✅ دسته‌بندی «آرایش و مراقبت لب» ایجاد شد.');
  }

  // ۲. ایجاد یا دریافت نویسنده تخصصی
  let author = await authorRepo.findOneBy({ slug: 'dr-elham-shams' });
  if (!author) {
    author = authorRepo.create({
      name: 'دکتر الهام شمس',
      slug: 'dr-elham-shams',
      jobTitle: 'متخصص پوست، مو و نویسنده ارشد مجله نیمورا',
      bio: 'پزشک پوست و زیبایی با بیش از ۱۰ سال سابقه در حوزه درماتولوژی، مشاوره مراقبت از پوست و بررسی تخصصی فرمولاسیون‌های آرایشی و بهداشتی.',
      avatar: 'https://images.unsplash.com/photo-1594824813589-9a7003463a56?auto=format&fit=crop&w=400&q=80',
      socialLinks: {
        instagram: 'https://instagram.com/nimoura.shop',
      },
      isActive: true,
    });
    author = await authorRepo.save(author);
    console.log('✅ نویسنده «دکتر الهام شمس» ثبت شد.');
  }

  // ۳. ایجاد یا دریافت برچسب‌ها (Tags)
  const tagNames = [
    { name: 'تینت لب', slug: 'lip-tint' },
    { name: 'شیدینگ لب', slug: 'lip-shading' },
    { name: 'آرایش لب', slug: 'lip-makeup' },
    { name: 'میکروپیگمنتیشن', slug: 'micropigmentation' },
    { name: 'راهنمای خرید', slug: 'buying-guide' },
    { name: 'زیبایی لب', slug: 'lip-beauty' },
  ];

  const tags: Tag[] = [];
  for (const t of tagNames) {
    let existingTag = await tagRepo.findOneBy({ slug: t.slug });
    if (!existingTag) {
      existingTag = tagRepo.create({ name: t.name, slug: t.slug });
      existingTag = await tagRepo.save(existingTag);
    }
    tags.push(existingTag);
  }
  console.log(`✅ ${tags.length} برچسب مجله آماده شد.`);

  // ۴. دریافت شناسه‌های واقعی چند محصول از فروشگاه برای اسلایدر
  const sampleProducts = await productRepo.find({
    select: { id: true, title: true },
    where: { isAvailable: true },
    take: 6,
  });

  const relatedProductIds = sampleProducts.length > 0
    ? sampleProducts.map((p) => String(p.id))
    : ['1', '2', '3'];

  const sliderIdsAttr = relatedProductIds.slice(0, 4).join(',');

  // ۵. محتوای غنی مقاله با جدول مقایسه، اسلایدر و بخش‌های کامل
  const content = `
<p>داشتن لب‌هایی خوش‌رنگ، باطراوت و شاداب یکی از مهم‌ترین پایه‌های یک چهره سرزنده و جذاب است. در سال‌های اخیر با ترند شدن آرایش‌های سبک نچرال و بدون آرایش سنگین (Clean Girl & No-Makeup Makeup)، دو روش بیش از هر چیز توجه عاشقان زیبایی را به خود جلب کرده است: <strong>تینت لب (Lip Tint)</strong> و <strong>شیدینگ لب (Lip Shading / Lip Blush)</strong>.</p>

<p>اما سوال اصلی این است: کدام‌یک از این دو روش برای شما مناسب‌تر است؟ آیا پرداخت هزینه بالاتر برای شیدینگ نیمه‌دائمی ارزشش را دارد، یا استفاده روزانه از تینت‌های باکیفیت و سبک گزینه منطقی‌تری است؟ در این مقاله تخصصی از <em>مجله زیبایی نیمورا</em>، هر دو روش را از نظر ماندگاری، میزان درد، هزینه، عوارض و جلوه ظاهری کالبدشکافی می‌کنیم.</p>

<h2>تینت لب چیست و چرا تا این حد محبوب شد؟</h2>
<p>تینت لب (Lip Tint) یک محصول آرایشی سبک و بر پایه آب یا ژل است که اولین بار از صنعت زیبایی کره جنوبی (K-Beauty) به سراسر جهان معرفی شد. بر خلاف رژلب‌های سنتی که حاوی موم، چربی‌های سنگین و لایه‌های ضخیم رنگی هستند، تینت لب به سرعت جذب پوست لب شده و رنگدانه‌ها را مستقیماً به بافت لب تزریق می‌کند.</p>

<p>نتیجه این فرمولاسیون هوشمندانه، جلوه‌ای شبیه به رنگ طبیعی لب‌های گل‌انداخته است؛ گویی خود لب‌های شما ذاتاً این رنگ شاداب و صورتی ملایم را دارند و هیچ لایه چسبنده‌ای روی آن حس نمی‌شود.</p>

<ul>
  <li><strong>بافت فوق‌العاده سبک و تنفس‌پذیر:</strong> هیچ حس سنگینی، ماسیدگی یا چسبندگی روی لب ایجاد نمی‌کند.</li>
  <li><strong>ضد لک و بدون رد:</strong> به لیوان، ماسک یا لباس رنگ پس نمی‌دهد و تا ساعت‌ها فیکس می‌ماند.</li>
  <li><strong>ترکیبات آبرسان:</strong> اغلب تینت‌های مدرن حاوی ویتامین E، عصاره انار و هیالورونیک اسید هستند.</li>
  <li><strong>بدون سرب و مواد مضر سنگین:</strong> برای مصرف روزانه و طولانی‌مدت بسیار ایمن‌تر است.</li>
</ul>

<h2>شیدینگ لب چیست و چه مراحلی دارد؟</h2>
<p>شیدینگ لب (که با نام‌های میکروپیگمنتیشن لب، تاتوی رژلب یا Lip Blushing نیز شناخته می‌شود) یک روش آرایش نیمه‌دائمی (Semi-Permanent Makeup) است. در این تکنیک، پیگمنتر متخصص با استفاده از یک دستگاه مخصوص و سوزن‌های ظریف، رنگدانه‌های ارگانیک و معدنی را در لایه‌های سطحی اپیدرم و درم پوست لب تزریق می‌کند.</p>

<p>هدف شیدینگ لب، ایجاد یک کانتور محو، اصلاح عدم تقارن لب‌ها، پوشش تیرگی یا بی‌رنگی طبیعی لب و ایجاد یک تناژ رنگی ماندگار و یکدست است که بین ۱ تا ۳ سال روی لب‌ها باقی می‌ماند.</p>

<ul>
  <li><strong>مدت زمان انجام کار:</strong> بین ۱.۵ تا ۲.۵ ساعت زمان می‌برد.</li>
  <li><strong>نیاز به بی‌حسی موضعی:</strong> پیش از شروع کار از پمادهای بی‌حسی حاوی لیدوکائین استفاده می‌شود.</li>
  <li><strong>دوره نقاهت ۳ تا ۵ روزه:</strong> لب‌ها دچار تورم خفیف و سپس پوسته‌ریزی می‌شوند تا رنگ اصلی پدیدار شود.</li>
  <li><strong>جلسه ترمیم (Touch-up):</strong> معمولاً ۴ تا ۶ هفته بعد برای تثبیت یکنواختی رنگ لازم است.</li>
</ul>

<h2>جدول مقایسه جامع تینت لب و شیدینگ لب</h2>
<p>برای درک بهتر تفاوت‌های اساسی این دو روش زیبایی، جدول زیر را مطالعه کنید:</p>

<table>
  <thead>
    <tr>
      <th>معیار مقایسه</th>
      <th>تینت لب (Lip Tint)</th>
      <th>شیدینگ لب (Lip Shading)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>نوع روش</strong></td>
      <td>محصول آرایشی موقت روزانه</td>
      <td>آرایش نیمه‌دائمی کلینیکی (تکنیک میکروبلیدینگ)</td>
    </tr>
    <tr>
      <td><strong>میزان ماندگاری</strong></td>
      <td>۶ تا ۱۲ ساعت (با قابلیت تمدید آسان)</td>
      <td>۱ تا ۳ سال (نیاز به ترمیم دوره‌ای)</td>
    </tr>
    <tr>
      <td><strong>سطح درد و سوزش</strong></td>
      <td>کاملاً بدون درد و سوزش</td>
      <td>دارای درد خفیف تا متوسط (با بی‌حسی موضعی)</td>
    </tr>
    <tr>
      <td><strong>هزینه</strong></td>
      <td>بسیار اقتصادی و مقرون‌به‌صرفه</td>
      <td>هزینه نسبتاً بالا به همراه هزینه جلسات ترمیم</td>
    </tr>
    <tr>
      <td><strong>دوره نقاهت و مراقبت</strong></td>
      <td>بدون هیچ دوره نقاهت</td>
      <td>۳ تا ۷ روز پوسته ریزی، تورم و مراقبت با پماد</td>
    </tr>
    <tr>
      <td><strong>تنوع در تغییر رنگ</strong></td>
      <td>آزادی کامل در تغییر روزانه رنگ و مدل</td>
      <td>رنگ ثابت برای چندین سال (عدم امکان تغییر سریع)</td>
    </tr>
    <tr>
      <td><strong>احتمال عوارض یا تبخال</strong></td>
      <td>تقریباً صفر (در صورت استفاده از برند اصل)</td>
      <td>احتمال فعال شدن ویروس تبخال، ورم و آلرژی به رنگ</td>
    </tr>
    <tr>
      <td><strong>مناسب برای</strong></td>
      <td>استفاده روزانه، دانشگاه، محل کار و افراد حساس</td>
      <td>افراد شاغل با وقت کم، اصلاح قرینگی و تیرگی لب</td>
    </tr>
  </tbody>
</table>

<!-- اسلایدر محصولات درون متن -->
<div class="nimoura-product-slider my-8 p-4 rounded-2xl bg-nimoura-base/60 border border-nimoura-border/40" data-ids="${sliderIdsAttr}" data-title="پرفروش‌ترین محصولات مراقبت و آرایش لب نیمورا">
  <p class="text-sm font-bold text-nimoura-velvet mb-2">🛍️ محصولات پیشنهادی این بخش</p>
</div>

<h2>مزایا و معایب تینت لب</h2>
<h3>مزایای تینت لب:</h3>
<ul>
  <li>جلوه‌ای فوق‌العاده طبیعی و جوان‌کننده (Baby Lip Effect).</li>
  <li>امکان کنترل غلظت رنگ (با یک لایه رنگ لایت و با چند لایه رنگ غلیظ).</li>
  <li>قابل حمل بودن در کیف و استفاده در هر مکان و زمان تنها در چند ثانیه.</li>
  <li>هیچ خطری برای پوست لب و اعصاب حسی ندارد.</li>
  <li>قیمت بسیار مناسب و اقتصادی در مقایسه با روش‌های کلینیکی.</li>
</ul>

<h3>معایب تینت لب:</h3>
<ul>
  <li>به هر حال یک محصول موقت است و در انتهای روز باید پاک شود.</li>
  <li>اگر لب‌های شما پوسته‌پوسته و خشک باشد، رنگ در ترک‌ها جمع می‌شود (نیاز به اسکراب و بالم دارد).</li>
</ul>

<h2>مزایا و معایب شیدینگ لب</h2>
<h3>مزایای شیدینگ لب:</h3>
<ul>
  <li>بیدار شدن هر روز صبح با لب‌هایی شاداب و آماده بدون نیاز به هیچ آرایشی.</li>
  <li>اصلاح عدم تقارن و کجی مرز لب‌ها.</li>
  <li>خنثی‌سازی تیرگی طبیعی لب و روشن‌تر کردن رنگ پایه لب‌ها.</li>
</ul>

<h3>معایب شیدینگ لب:</h3>
<ul>
  <li>خطر تبخال پس از انجام کار (حتی در کسانی که سابقه تبخال نداشته‌اند).</li>
  <li>اگر از رنگ انتخابی خسته شوید یا پیگمنتر مهارت کافی نداشته باشد، پاک کردن آن فرآیندی دشوار و پرهزینه با لیزر است.</li>
  <li>احتمال تغییر رنگ پیگمنت در طول زمان به سمت بنفش، خاکستری یا آجری کدر در اثر نور آفتاب یا رنگ بی‌کیفیت.</li>
</ul>

<h2>کدام روش برای شما بهتر است؟ راهنمای انتخاب نهایی</h2>
<p>پاسخ به این سوال مستقیماً به سبک زندگی، بودجه و اولویت‌های زیبایی شما بستگی دارد:</p>

<blockquote>
«اگر فردی هستید که تنوع را دوست دارید، از ریسک‌های تاتوی دائمی دوری می‌کنید و خواهان زیبایی بی‌دردسر و بی‌خطر با هزینه معقول هستید، <strong>تینت لب</strong> برنده مطلق برای شماست. اما اگر ورزشکارید، روزانه تایم زیادی برای آماده شدن ندارید یا لب‌هایتان فرم نامتقارن و بسیار بی‌رنگ دارد، <strong>شیدینگ لب</strong> در یک کلینیک کاملاً معتبر گزینه‌ای قابل تامل است.»
</blockquote>

<h2>نکات طلایی حفظ شادابی و سلامت لب‌ها</h2>
<p>صرف‌نظر از اینکه تینت را انتخاب کنید یا شیدینگ، سلامت زیرساخت لب اهمیت حیاتی دارد. رعایت این سه نکته لب‌های شما را همیشه جوان و شاداب نگه می‌دارد:</p>
<ol>
  <li><strong>اسکراب هفتگی ملایم:</strong> هفته‌ای یک‌بار با ترکیب شکر قهوه‌ای و روغن نارگیل سلول‌های مرده لب را پاکسازی کنید.</li>
  <li><strong>بالم لب حاوی فیلتر ضدآفتاب (SPF):</strong> لب‌ها فاقد غدد چربی هستند و نور آفتاب عامل اصلی تیرگی و چروک زودهنگام لب است.</li>
  <li><strong>آبرسانی منظم شبانه:</strong> قبل از خواب از بالم‌های مغذی حاوی شی‌باتر یا ماسک خواب لب استفاده کنید.</li>
</ol>
`.trim();

  // ۶. سوالات متداول انتهای مقاله (FAQ)
  const faqs = [
    {
      question: 'آیا استفاده روزانه از تینت لب باعث خشکی و تیرگی لب می‌شود؟',
      answer:
        'خیر، به شرطی که از تینت‌های اصل و برندهای معتبر فاقد سرب استفاده کنید. تینت‌های مرغوب بر پایه آب و مواد آبرسان ساخته شده‌اند. تنها نکته این است که در طول روز پس از جذب تینت، از یک لایه بالم لب برای حفظ رطوبت استفاده نمایید.',
    },
    {
      question: 'شیدینگ لب چقدر درد دارد و آیا به بی‌حسی نیاز است؟',
      answer:
        'لب یکی از نقاط پرعصب صورت است؛ به همین دلیل پیگمنتر از کرم‌های بی‌حسی قوی موضعی (لیدوکائین) استفاده می‌کند. درد به صورت سوزش خفیف تا متوسط توصیف می‌شود و اغلب افراد به خوبی آن را تحمل می‌کنند.',
    },
    {
      question: 'آیا می‌توان بعد از شیدینگ لب، از رژلب یا تینت استفاده کرد؟',
      answer:
        'در دوره بهبودی اولیه (۲ تا ۳ هفته اول) استفاده از هرگونه لوازم آرایشی روی لب ممنوع است. اما پس از بهبودی کامل، می‌توانید برای مهمانی‌ها و مراسم ویژه هر رنگ رژ یا تینت دیگری را به دلخواه روی آن بزنید.',
    },
    {
      question: 'ماندگاری شیدینگ لب چقدر است و چه زمانی نیاز به ترمیم دارد؟',
      answer:
        'ماندگاری شیدینگ لب بسته به نوع پوست، متابولیسم بدن، سبک زندگی و قرارگیری در معرض آفتاب بین ۱۲ تا ۲۴ ماه است. معمولاً یک جلسه ترمیم ۴ هفته پس از کار اول، و سپس یک ترمیم سالیانه توصیه می‌شود.',
    },
    {
      question: 'چه کسانی نباید شیدینگ لب انجام دهند؟',
      answer:
        'بانوان باردار و شیرده، افراد مبتلا به بیماری‌های خودایمنی شدید، افراد تحت درمان‌های خاص رقیق‌کننده خون یا راکوتان، و کسانی که به طور مکرر تبخال فعال می‌زنند بدون مصرف داروی ضدویروس نباید این کار را انجام دهند.',
    },
  ];

  // ۷. ایجاد یا به‌روزرسانی مقاله در دیتابیس
  const slug = 'lip-tint-vs-lip-shading';
  let article = await articleRepo.findOne({
    where: { slug },
    relations: { tags: true },
  });

  const articleData: Partial<Article> = {
    title: 'فرق تینت لب و شیدینگ لب چیست؟ کدام بهتر است؟',
    slug,
    summary:
      'مقایسه جامع و تخصصی تینت لب و شیدینگ لب (میکروپیگمنتیشن و تاتو لب) از نظر ماندگاری، میزان درد، هزینه، عوارض، جلوه طبیعی و نحوه انتخاب بهترین گزینه بر اساس نوع پوست و سبک زندگی شما.',
    content,
    coverImage:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1400&auto=format&fit=crop',
    coverImageAlt: 'مقایسه تینت لب و شیدینگ لب - کدام بهتر است؟',
    status: ArticleStatus.PUBLISHED,
    isFeatured: true,
    readingTime: 7,
    metaTitle: 'فرق تینت لب و شیدینگ لب چیست؟ مقایسه تخصصی + کدام بهتر است؟',
    metaDescription:
      'بررسی تفاوت‌های کلیدی تینت لب و شیدینگ لب (میکروپیگمنتیشن) از نظر ماندگاری، هزینه، درد و عوارض. راهنمای کامل انتخاب بهترین گزینه برای لب‌های شما.',
    metaKeywords:
      'تینت لب, شیدینگ لب, فرق تینت و شیدینگ, مقایسه تینت لب, میکروپیگمنتیشن لب, تاتو لب, آرایش لب, زیبایی لب',
    author,
    category,
    tags,
    relatedProductIds,
    faqs,
    publishedAt: new Date(),
  };

  if (article) {
    Object.assign(article, articleData);
    article = await articleRepo.save(article);
    console.log(`✨ مقاله موجود «${article.title}» با موفقیت به‌روزرسانی شد!`);
  } else {
    article = articleRepo.create(articleData);
    article = await articleRepo.save(article);
    console.log(`🎉 مقاله جدید «${article.title}» با موفقیت ایجاد و منتشر شد!`);
  }

  console.log('📌 آدرس مشاهده در وبسایت: /magazine/lip-tint-vs-lip-shading');
  console.log('🏁 سید مجله نیمورا با موفقیت به پایان رسید.');
}

// امکان اجرای مستقیم فایل به صورت اسکریپت CLI
if (require.main === module) {
  (async () => {
    try {
      const ds = await dataSource.initialize();
      await seed(ds);
      await ds.destroy();
      process.exit(0);
    } catch (err: any) {
      console.error('❌ خطا در اجرای seed مجله:', err);
      process.exit(1);
    }
  })();
}
