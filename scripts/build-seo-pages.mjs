import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = "https://vicecityforums.com";
const modified = "2026-09-09";
const modifiedLabel = "September 9, 2026";
const officialHome = "https://www.rockstargames.com/VI";
const officialWorld = "https://www.rockstargames.com/VI/only-in-leonida";
const officialVideos = "https://www.rockstargames.com/VI/media/videos";
const officialExtendedLook = "https://www.rockstargames.com/VI/an-extended-look";
const officialStore = "https://store.rockstargames.com/game/buy-gta-vi";
const officialScreenshots = "https://www.rockstargames.com/VI/media/screenshots";
const officialControllerNews = "https://blog.playstation.com/2026/09/03/first-look-at-the-grand-theft-auto-vi-limited-edition-dualsense-wireless-controllers/";

const pages = [
  {
    slug: "gta-6-news",
    title: "GTA 6 News: Confirmed Updates & Release Tracker",
    description: "Track confirmed GTA 6 news, official Rockstar announcements, release-date updates, trailers, platforms, characters, and Vice City developments.",
    kicker: "Verified update tracker",
    h1: "GTA 6 News: Confirmed Updates",
    intro: "A clean, source-first GTA 6 news tracker. Official facts are separated from community analysis so you can see what Rockstar has confirmed without rumor being presented as news.",
    type: "NewsArticle",
    facts: [
      ["Release date", "November 19, 2026"],
      ["Confirmed consoles", "PlayStation 5 · Xbox Series X|S"],
      ["Latest first-party update", "DualSense controllers · September 3, 2026"],
    ],
    body: `
      <h2>Latest confirmed GTA 6 news</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">September 3, 2026</span><h3>Two limited-edition DualSense controllers revealed</h3><p>PlayStation revealed Black and White GTA VI Limited Edition DualSense controllers. Pre-orders begin September 10 at 10 a.m. local time, and both launch alongside the game on November 19.</p></article>
        <article class="card"><span class="meta">August 27, 2026</span><h3>An Extended Look is now playing</h3><p>Rockstar added <strong>Grand Theft Auto VI: An Extended Look</strong> to the official media lineup. It now appears beside Trailer 2 and Trailer 1 on Rockstar's GTA VI site.</p></article>
        <article class="card"><span class="meta">June 25, 2026</span><h3>Pre-order timing announced</h3><p>Rockstar's featured-news list records its pre-order announcement for June 25, 2026. Platform and edition details should always be checked against the current official store page.</p></article>
        <article class="card"><span class="meta">November 6, 2025</span><h3>Launch moved to November 2026</h3><p>Rockstar confirmed that GTA 6 is set to launch on <strong>November 19, 2026</strong>. The current official game page continues to display that date.</p></article>
        <article class="card"><span class="meta">Current official status</span><h3>Vice City and Leonida remain central</h3><p>The story follows Jason Duval and Lucia Caminos after a score goes wrong and pulls them into a conspiracy spanning the state of Leonida.</p></article>
      </div>
      <div class="callout"><strong>Our verification rule</strong><p>A claim is labeled “confirmed” only when it appears on a Rockstar-controlled page or another direct first-party source. Trailer observations are identified as observations; predictions and theories stay labeled as community discussion.</p></div>
      <h2>What is confirmed right now?</h2>
      <p>Rockstar currently lists <strong>November 19, 2026</strong> as the launch date and names <strong>PlayStation 5</strong> and <strong>Xbox Series X|S</strong> as platforms. The official world material identifies Vice City as part of the state of Leonida and introduces Jason, Lucia, and a wider supporting cast. Rockstar's store also lists Standard and Ultimate editions, a November 12 preload date, and a Vintage Vice City pre-order pack.</p>
      <p>Rockstar's media library currently groups three major videos—An Extended Look, Trailer 2, and Trailer 1—along with official character and cover-art clips. That gives the community more material to study while keeping speculation anchored to footage Rockstar actually published.</p>
      <h2>What is not confirmed?</h2>
      <p>An exact PC release date is not listed on Rockstar's current GTA VI landing page. Exact map dimensions, every gameplay system, the full mission list, and a complete post-launch roadmap also remain unconfirmed. Treat unattributed screenshots, “insider” posts, and unlabeled AI footage as unverified until a primary source supports them.</p>
    `,
    faqs: [
      ["What is the confirmed GTA 6 release date?", "Rockstar currently lists November 19, 2026 as the GTA 6 release date."],
      ["Which platforms are confirmed for GTA 6?", "Rockstar currently lists PlayStation 5 and Xbox Series X|S."],
      ["Has Rockstar confirmed GTA 6 for PC?", "A PC version is not listed on Rockstar's current GTA VI landing page as of September 9, 2026."],
    ],
    sources: [["Official GTA VI site", officialHome], ["Official GTA VI store", officialStore], ["PlayStation Blog — limited-edition controllers", officialControllerNews], ["Official GTA VI videos", officialVideos], ["Official people and places", officialWorld]],
  },
  {
    slug: "gta-6-release-date",
    title: "GTA 6 Release Date, Platforms & Current Status",
    description: "GTA 6 is scheduled for November 19, 2026. See confirmed platforms, current PC status, official source links, and what remains unannounced.",
    kicker: "Launch status",
    h1: "GTA 6 Release Date & Platforms",
    intro: "The current official launch information in one place, with clear labels for what is confirmed and what Rockstar has not announced.",
    type: "Article",
    facts: [
      ["Launch date", "November 19, 2026"],
      ["PlayStation", "PlayStation 5"],
      ["Xbox", "Xbox Series X|S"],
    ],
    body: `
      <h2>When does GTA 6 come out?</h2>
      <p><strong>Grand Theft Auto VI is scheduled to launch on November 19, 2026.</strong> Rockstar displays the date prominently on the official GTA VI page. This page is checked against that first-party source instead of repeating third-party countdowns.</p>
      <h2>Confirmed GTA 6 platforms</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Confirmed</span><h3>PlayStation 5</h3><p>Rockstar lists PlayStation 5 as a launch platform and says the game plays best on PS5.</p></article>
        <article class="card"><span class="meta">Confirmed</span><h3>Xbox Series X|S</h3><p>Rockstar lists Xbox Series X and Xbox Series S on the current official game page.</p></article>
        <article class="card"><span class="meta">Not currently listed</span><h3>PC</h3><p>Rockstar's current GTA VI landing page does not list a PC launch. That does not prove a PC version will never happen; it means no official PC release information is displayed there now.</p></article>
        <article class="card"><span class="meta">Not currently listed</span><h3>Previous-generation consoles</h3><p>PlayStation 4 and Xbox One are not named on Rockstar's current platform list.</p></article>
      </div>
      <div class="callout"><strong>Status discipline</strong><p>If Rockstar changes the date or platform list, this tracker should be updated from the official page before social posts or videos repeat the change.</p></div>
      <h2>What to watch before launch</h2>
      <p>For the clearest pre-release picture, start with Rockstar's official game page, then watch An Extended Look, Trailer 2, and Trailer 1 in the official media library. Community breakdowns can help surface details, but they should never replace the primary material.</p>
    `,
    faqs: [
      ["Is GTA 6 delayed?", "Rockstar's current official date is November 19, 2026. Any newer delay claim should be checked directly against Rockstar's GTA VI page."],
      ["Will GTA 6 launch on PC?", "Rockstar has not listed a PC version on its current GTA VI landing page as of September 9, 2026."],
      ["Is GTA 6 coming to PS4 or Xbox One?", "Rockstar currently lists PS5 and Xbox Series X|S, not PS4 or Xbox One."],
    ],
    sources: [["Rockstar Games — Grand Theft Auto VI", officialHome]],
  },
  {
    slug: "gta-6-characters",
    title: "GTA 6 Characters: Jason, Lucia & Confirmed Cast",
    description: "Meet the confirmed GTA 6 characters: Jason Duval, Lucia Caminos, Cal Hampton, Boobie Ike, Dre'Quan Priest, Real Dimez, Raul Bautista, and Brian Heder.",
    kicker: "Confirmed character guide",
    h1: "GTA 6 Characters",
    intro: "A spoiler-light guide to the people Rockstar has officially introduced across Vice City and Leonida.",
    type: "Article",
    facts: [
      ["Lead characters", "Jason Duval · Lucia Caminos"],
      ["Setting", "Vice City · State of Leonida"],
      ["Source standard", "Official Rockstar profiles"],
    ],
    body: `
      <h2>Main characters</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Protagonist</span><h3>Jason Duval</h3><p>Jason grew up around crime, spent time in the Army, and later worked with local drug runners in the Keys. He wants a simpler life, but meeting Lucia may pull him in the opposite direction.</p></article>
        <article class="card"><span class="meta">Protagonist</span><h3>Lucia Caminos</h3><p>Lucia leaves the Leonida Penitentiary determined to make smarter moves and build the good life her family imagined. Her partnership with Jason sits at the center of the story.</p></article>
      </div>
      <h2>Supporting cast</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Jason's circle</span><h3>Cal Hampton</h3><p>Cal is Jason's friend and a fellow associate of Brian. He prefers staying home, monitoring communications, and following theories from a safe distance.</p></article>
        <article class="card"><span class="meta">Vice City business</span><h3>Boobie Ike</h3><p>A local Vice City figure whose businesses span property, nightlife, and music. His partnership with Dre'Quan and Only Raw Records matters to his next move.</p></article>
        <article class="card"><span class="meta">Music scene</span><h3>Dre'Quan Priest</h3><p>Dre'Quan is a hustler focused on turning music into his real career. After signing Real Dimez, he is aiming beyond booking acts at Boobie's club.</p></article>
        <article class="card"><span class="meta">Music duo</span><h3>Real Dimez</h3><p>Bae-Luxe and Roxy are longtime friends who turned social-media momentum and rap records into a shot with Only Raw Records.</p></article>
        <article class="card"><span class="meta">Professional robber</span><h3>Raul Bautista</h3><p>Raul is an experienced bank robber with the confidence to recruit ambitious talent—and a willingness to keep raising the stakes.</p></article>
        <article class="card"><span class="meta">The Keys</span><h3>Brian Heder</h3><p>Brian is an old-school smuggler who operates from a boat yard in the Keys. He gives Jason a place to stay in exchange for help with local work.</p></article>
      </div>
      <div class="callout"><strong>Spoiler policy</strong><p>This page summarizes only character information Rockstar has published openly. Community theories should stay in clearly labeled discussion threads.</p></div>
      <h2>How Jason and Lucia connect</h2>
      <p>Rockstar's official setup says an easy score goes wrong and places Jason and Lucia inside a criminal conspiracy stretching across Leonida. The pair are forced to depend on each other, making their relationship the clearest through-line in the public story material.</p>
    `,
    faqs: [
      ["Who are the main characters in GTA 6?", "The two central characters officially introduced by Rockstar are Jason Duval and Lucia Caminos."],
      ["What is Lucia's full name in GTA 6?", "Rockstar identifies her as Lucia Caminos."],
      ["What is Jason's full name in GTA 6?", "Rockstar identifies him as Jason Duval."],
    ],
    sources: [["Rockstar Games — Only in Leonida", officialWorld]],
  },
  {
    slug: "gta-6-map-locations",
    title: "GTA 6 Map & Locations: Vice City and Leonida Guide",
    description: "Explore the officially named GTA 6 map locations: Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, and Mount Kalaga.",
    kicker: "Confirmed world guide",
    h1: "GTA 6 Map & Leonida Locations",
    intro: "Rockstar has revealed a state-sized setting built around Vice City and several named regions. This guide keeps confirmed locations separate from fan-made maps and size estimates.",
    type: "Article",
    facts: [
      ["State", "Leonida"],
      ["Core city", "Vice City"],
      ["Named areas", "Six revealed regions"],
    ],
    body: `
      <h2>Officially named GTA 6 locations</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Urban center</span><h3>Vice City</h3><p>The neon-soaked city at the center of GTA 6's identity. Rockstar describes Leonida as stretching beyond Vice City's streets into a wider state.</p></article>
        <article class="card"><span class="meta">Coastal region</span><h3>Leonida Keys</h3><p>The Keys connect Jason's background and Brian's boat-yard operation to the state's island and waterfront side.</p></article>
        <article class="card"><span class="meta">Wetlands</span><h3>Grassrivers</h3><p>An officially named Leonida destination associated with the state's marsh and wildlife terrain.</p></article>
        <article class="card"><span class="meta">Coastal city</span><h3>Port Gellhorn</h3><p>One of Rockstar's named destinations outside central Vice City. Its exact boundaries and full gameplay role remain to be established.</p></article>
        <article class="card"><span class="meta">Industrial region</span><h3>Ambrosia</h3><p>An officially introduced Leonida area that broadens the setting beyond beaches and nightlife.</p></article>
        <article class="card"><span class="meta">Northern terrain</span><h3>Mount Kalaga</h3><p>A named destination that signals more varied inland and elevated terrain across the state.</p></article>
      </div>
      <h2>How big is the GTA 6 map?</h2>
      <p>Rockstar has not published a definitive square-mile measurement on the official GTA VI pages cited here. Community overlays and coordinate estimates can be interesting, but they are reconstructions—not an official map-size announcement.</p>
      <div class="callout"><strong>Map-analysis standard</strong><p>Confirmed place names come from Rockstar. Reconstructed roads, borders, distances, and interiors should be labeled as estimates until the final game or an official map settles them.</p></div>
      <h2>Why Leonida matters</h2>
      <p>Moving from a single-city frame to the wider state of Leonida creates room for dense nightlife, highways, islands, wetlands, smaller communities, industrial districts, and more remote terrain. The named destinations already show that GTA 6's world is intended to feel broader than one downtown skyline.</p>
    `,
    faqs: [
      ["Where is GTA 6 set?", "GTA 6 is set in Vice City and the wider fictional state of Leonida."],
      ["What locations are confirmed in GTA 6?", "Rockstar has named Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, and Mount Kalaga."],
      ["Has Rockstar confirmed the exact GTA 6 map size?", "No exact square-mile measurement appears on the official GTA VI pages cited here as of September 9, 2026."],
    ],
    sources: [["Rockstar Games — Only in Leonida", officialWorld]],
  },
  {
    slug: "gta-6-trailers",
    title: "GTA 6 Trailers: Official Videos & Breakdown Guide",
    description: "Watch the official GTA 6 video lineup and explore source-labeled breakdowns of An Extended Look, Trailer 2, Trailer 1, and Rockstar's character clips.",
    kicker: "Official video index",
    h1: "GTA 6 Trailers & Official Videos",
    intro: "Start with Rockstar's source footage, then join breakdowns that clearly separate what appears on screen from theory.",
    type: "Article",
    facts: [
      ["Major official videos", "3"],
      ["Official short clips", "9"],
      ["Newest major video", "An Extended Look"],
    ],
    body: `
      <h2>Official GTA 6 video lineup</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Newest major video</span><h3>An Extended Look</h3><p>Rockstar's current GTA VI homepage features An Extended Look as the main playing video. It was added to the official news lineup on August 27, 2026.</p></article>
        <article class="card"><span class="meta">Official video</span><h3>Trailer 2</h3><p>The second numbered trailer remains available in Rockstar's media library and expands the public look at Jason, Lucia, and Leonida.</p></article>
        <article class="card"><span class="meta">Official video</span><h3>Trailer 1</h3><p>The first trailer established the return to Vice City, the Leonida atmosphere, Lucia's role, and the game's social-media-inflected presentation.</p></article>
        <article class="card"><span class="meta">Official clips</span><h3>Characters and cover art</h3><p>Rockstar also lists nine downloadable clips, including character videos for Jason, Lucia, Cal, Boobie, Dre'Quan, Real Dimez, Raul, and Brian.</p></article>
      </div>
      <h2>How our trailer breakdowns work</h2>
      <p>A useful breakdown should identify the exact official video, describe the visible moment, and label any interpretation. A vehicle visible in a shot is evidence that the vehicle appears in that marketing footage; it is not automatically proof of a specific customization system or mission.</p>
      <div class="callout"><strong>Watch the original first</strong><p>Use Rockstar's official media page as the source of truth. Cropped reposts can remove context, dates, disclosures, or frames that change the meaning of a clip.</p></div>
      <h2>Official footage versus fan concepts</h2>
      <p>Official Rockstar footage, community edits, fan animation, and AI-generated concepts can all be worth discussing. They should never share the same label. Clear provenance protects viewers, creators, and the long-term credibility of the community.</p>
    `,
    faqs: [
      ["How many official GTA 6 trailers are there?", "Rockstar's media page currently lists three major videos: An Extended Look, Trailer 2, and Trailer 1."],
      ["Where can I watch official GTA 6 videos?", "The safest source is Rockstar Games' official GTA VI video library."],
      ["Are all GTA 6 clips online real gameplay?", "No. Clips may be official footage, fan-made edits, AI-generated concepts, or mislabeled material. Check the original source before treating a clip as gameplay."],
    ],
    sources: [["Rockstar Games — GTA VI videos", officialVideos], ["Rockstar Games — GTA VI", officialHome]],
  },
  {
    slug: "gta-6-funny-clips",
    title: "GTA 6 Funny Clips, Fails, Glitches & NPC Chaos",
    description: "Discover source-labeled GTA 6 funny clips, fails, glitches, fan videos, and NPC chaos. Official, community, and AI footage are clearly identified.",
    kicker: "Community clip hub",
    h1: "GTA 6 Funny Clips & NPC Chaos",
    intro: "The home for funny GTA 6 moments—with the source and content type made clear before the joke starts.",
    type: "CollectionPage",
    facts: [
      ["Core series", "Funny moments · NPC chaos"],
      ["Also featured", "Fails · Glitches · Compilations"],
      ["Required", "Source and disclosure"],
    ],
    body: `
      <h2>What belongs in the clip hub?</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Series</span><h3>NPC Chaos Selfies</h3><p>Character-led snapshots and short scenes built around the absurd, unpredictable moments that make Vice City feel alive.</p></article>
        <article class="card"><span class="meta">Series</span><h3>Fails and glitches</h3><p>Unexpected physics, missed jumps, wrecks, bugs, and player mistakes—credited to the original source whenever the footage is submitted or discovered.</p></article>
        <article class="card"><span class="meta">Series</span><h3>Funny compilations</h3><p>Fast, themed edits that group related moments without stripping creator credit or changing what the footage actually is.</p></article>
        <article class="card"><span class="meta">Series</span><h3>Fan concepts</h3><p>Original fan-made or AI-assisted scenes can appear when they carry a visible disclosure and are never presented as leaked or player-captured gameplay.</p></article>
      </div>
      <h2>Clip labels you can trust</h2>
      <p>Every clip should be identifiable as <strong>official Rockstar footage</strong>, <strong>user gameplay</strong>, <strong>fan-made</strong>, or <strong>AI-generated</strong>. Unknown-source footage stays out of production until it can be traced. This is especially important before the game's November 19, 2026 launch, when misleading “gameplay” labels can spread faster than corrections.</p>
      <div class="callout"><strong>Creator-first policy</strong><p>Submit only footage you own or have permission to share. Keep the original source URL and creator credit attached to the clip from intake through publication.</p></div>
      <h2>Join the discussion</h2>
      <p>Use the <a href="/#category/clips-compilations">Clips & Compilations forum</a> to share a source, pitch a theme, identify a moment, or help verify whether footage is official, community-made, or synthetic.</p>
    `,
    faqs: [
      ["Can I submit a GTA 6 clip?", "Yes, if you own the footage or have permission to share it and include the original source and creator information."],
      ["Does Vice City Forums post AI-generated GTA 6 clips?", "AI-assisted concepts may be discussed or featured only when they are visibly disclosed and are not labeled as real gameplay."],
      ["What are NPC Chaos Selfies?", "They are original character-centered images and short scenes that frame unexpected Vice City chaos from an NPC-style point of view."],
    ],
    sources: [["Official GTA VI media for source comparison", officialVideos], ["Clips & Compilations forum", `${base}/#category/clips-compilations`]],
  },
  {
    slug: "gta-6-forums",
    title: "GTA 6 Forums: News, Theories, Clips & Community",
    description: "Join GTA 6 forums for verified news, trailer theories, Vice City map discussion, characters, vehicles, funny clips, crews, and community discoveries.",
    kicker: "Community directory",
    h1: "GTA 6 Forums & Community",
    intro: "A public, independent place to follow GTA 6 and meet the people who will be exploring Vice City with you.",
    type: "CollectionPage",
    facts: [
      ["Read access", "Public"],
      ["Member actions", "Post · Reply · Build a profile"],
      ["Community status", "Independent and fan-run"],
    ],
    body: `
      <h2>Choose a GTA 6 discussion</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Verified updates</span><h3>Official News</h3><p>Rockstar announcements, launch information, and source-linked updates without rumor presented as fact.</p></article>
        <article class="card"><span class="meta">World discovery</span><h3>Vice City & Leonida</h3><p>Map locations, environmental details, businesses, landmarks, wildlife, and what official footage reveals about the world.</p></article>
        <article class="card"><span class="meta">Game systems</span><h3>Gameplay & Vehicles</h3><p>Movement, driving, police behavior, weapons, activities, immersion systems, and vehicle wish lists.</p></article>
        <article class="card"><span class="meta">Video community</span><h3>Clips & Compilations</h3><p>Funny moments, fails, glitches, edits, trailer cuts, creator submissions, and source verification.</p></article>
        <article class="card"><span class="meta">Open conversation</span><h3>General Discussion</h3><p>Predictions, questions, rankings, memories from earlier GTA games, and everything that does not fit one district.</p></article>
        <article class="card"><span class="meta">Play together</span><h3>Crews & Roleplay</h3><p>Meet players, shape group identities, and prepare for shared stories—without pretending unannounced features are confirmed.</p></article>
      </div>
      <h2>Community rules in plain language</h2>
      <p>Anyone can read. Members can post and reply. Harassment, impersonation, spam, illegal content, and attempts to compromise the service may be removed. Label spoilers, credit creators, link sources, and distinguish confirmed information from theories.</p>
      <div class="callout"><strong>Founding Citizen campaign</strong><p>The first 100 completed member profiles qualify for early-member recognition. The count is tied to real completed accounts, not manufactured activity.</p></div>
      <p><a class="nav-cta" href="/#categories">Browse every forum and enter the city →</a></p>
    `,
    faqs: [
      ["Is Vice City Forums official?", "No. Vice City Forums is an independent fan community and is not affiliated with Rockstar Games or Take-Two Interactive."],
      ["Can I read the GTA 6 forums without an account?", "Yes. Public discussions can be read without an account; posting and replying require membership."],
      ["What can I discuss?", "Topics include confirmed news, trailers, characters, map locations, gameplay, vehicles, clips, compilations, crews, roleplay, and clearly labeled theories."],
    ],
    sources: [["Enter Vice City Forums", `${base}/#categories`], ["Official GTA VI source", officialHome]],
  },
  {
    slug: "gta-6-pre-order",
    title: "GTA 6 Pre-Order: Editions, Bonuses & Preload",
    description: "Compare the official GTA 6 Standard and Ultimate editions, Vintage Vice City pre-order bonuses, preload date, and physical code-in-box details.",
    kicker: "Official buying guide",
    h1: "GTA 6 Pre-Order & Editions",
    intro: "A source-checked guide to the versions, bonuses, preload timing, and format details Rockstar currently lists for GTA 6.",
    type: "Article",
    facts: [
      ["Preload begins", "November 12, 2026"],
      ["Launch date", "November 19, 2026"],
      ["Official editions", "Standard · Ultimate"],
    ],
    body: `
      <h2>What GTA 6 editions can you pre-order?</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Core game</span><h3>Standard Edition</h3><p>The Standard Edition is the straightforward way into Grand Theft Auto VI. Rockstar's store lists it for PlayStation 5 and Xbox Series X|S, with the eligible pre-order offer shown separately on the same official page.</p></article>
        <article class="card"><span class="meta">Expanded bundle</span><h3>Ultimate Edition</h3><p>The Ultimate Edition includes the game plus a set of vehicles, weapons, styles, properties, businesses, and other in-game items named on Rockstar's store. Check the official listing for the current region-specific price and complete terms.</p></article>
      </div>
      <h2>What is in the Vintage Vice City pre-order pack?</h2>
      <p>Rockstar currently lists a <strong>1955 Vapid Stanier sedan and garage</strong>, three outfits, three hairstyles, and a weapon pattern in the Vintage Vice City pack. The store also advertises one free month of GTA+ for eligible digital pre-orders made through the Rockstar Store. Eligibility, redemption timing, platform requirements, and regional terms can change, so verify the live offer before paying.</p>
      <h2>When can GTA 6 be preloaded?</h2>
      <p>The official store displays <strong>November 12, 2026</strong> as the preload date, one week before the listed November 19 launch. A preload lets supported consoles download game data early; it does not necessarily mean the game will unlock at the same clock time in every region.</p>
      <div class="callout"><strong>Physical-copy detail</strong><p>Rockstar's store says its physical versions are code-in-box and do not include a disc. If a disc matters to you, read the format line on the exact retailer and edition listing before ordering.</p></div>
      <h2>How to compare prices safely</h2>
      <p>Use Rockstar's official store as the baseline, then compare the same platform, edition, region, tax treatment, and delivery format at authorized retailers. Avoid listings that promise unannounced access, unknown “exclusive” content, or account credentials instead of a legitimate game code.</p>
      <p>Prices are deliberately not copied onto this page because currency, tax, and regional storefronts vary. The source link remains the fastest way to see the amount and legal terms that apply to you.</p>
    `,
    faqs: [
      ["When does GTA 6 preload start?", "Rockstar's store currently lists November 12, 2026 as the preload date."],
      ["What GTA 6 editions are official?", "Rockstar currently lists Standard and Ultimate editions on its official store."],
      ["Does the physical GTA 6 box include a disc?", "Rockstar's store currently describes its physical versions as code-in-box with no disc."],
    ],
    sources: [["Rockstar Store — GTA VI", officialStore], ["Official GTA VI site", officialHome]],
  },
  {
    slug: "gta-6-gameplay",
    title: "GTA 6 Gameplay: Confirmed Footage & Features",
    description: "Explore confirmed GTA 6 gameplay footage, what Rockstar's PS5 extended look actually shows, and which systems remain community interpretation.",
    kicker: "Footage verification guide",
    h1: "GTA 6 Gameplay: What Is Confirmed",
    intro: "A frame-by-frame mindset for separating Rockstar's captured game footage from reasonable observation, speculation, and fan-made clips.",
    type: "Article",
    facts: [
      ["Newest official video", "An Extended Look"],
      ["Capture disclosure", "In-game footage on PS5"],
      ["Published", "August 27, 2026"],
    ],
    body: `
      <h2>Is the GTA 6 extended look gameplay?</h2>
      <p>Rockstar describes <strong>Grand Theft Auto VI: An Extended Look</strong> as captured entirely from in-game footage on PlayStation 5. That makes it first-party game material, but the safest analysis still distinguishes a visible action from a fully documented player-controlled mechanic.</p>
      <div class="card-grid">
        <article class="card"><span class="meta">Directly confirmed</span><h3>Source and capture platform</h3><p>The video is hosted by Rockstar, dated August 27, 2026, and carries Rockstar's statement that the footage was captured in-game on PS5.</p></article>
        <article class="card"><span class="meta">Visible observation</span><h3>People, places, and vehicles</h3><p>Viewers can identify characters, locations, traffic, interiors, crowds, weather, animation, and other on-screen details. Those visual observations are stronger than claims about controls or hidden systems.</p></article>
        <article class="card"><span class="meta">Needs confirmation</span><h3>Exact mechanics</h3><p>A scene may suggest stealth, interaction, customization, police behavior, or side activities without explaining player freedom, rules, progression, or whether the moment belongs to a mission.</p></article>
        <article class="card"><span class="meta">Not source footage</span><h3>Mods, concepts, and AI</h3><p>Community creations can be impressive, funny, or useful for discussion. They must be labeled clearly and should never be reposted as a leak or an official gameplay capture.</p></article>
      </div>
      <h2>A better way to discuss GTA 6 gameplay</h2>
      <p>Start each claim with its evidence level: <strong>Rockstar states</strong>, <strong>the footage shows</strong>, <strong>this may suggest</strong>, or <strong>community theory</strong>. Include the video name and a timestamp when possible. This makes theories easier to debate and corrections easier to trace.</p>
      <div class="callout"><strong>Evidence rule</strong><p>Seeing an action once confirms that the action appears in the marketing footage. It does not automatically establish a repeatable open-world system, final performance target, difficulty setting, or launch-day feature.</p></div>
      <h2>Where to watch before reading breakdowns</h2>
      <p>Watch Rockstar's original extended-look page first, then use the official media library for Trailer 2, Trailer 1, and the character clips. Original uploads preserve the disclosure, resolution, sequence, and context that cropped social reposts often lose.</p>
    `,
    faqs: [
      ["Was the GTA 6 extended look captured in-game?", "Yes. Rockstar says the extended look was captured entirely from in-game footage on PlayStation 5."],
      ["Does every visible action confirm a gameplay mechanic?", "No. A visible moment can support an observation without proving how broadly or freely that action works in the final game."],
      ["Where should I watch official GTA 6 footage?", "Use Rockstar's GTA VI site and media library so the source, disclosures, and full context stay attached."],
    ],
    sources: [["Rockstar Games — An Extended Look", officialExtendedLook], ["Rockstar Games — GTA VI videos", officialVideos]],
  },
  {
    slug: "gta-6-pc",
    title: "GTA 6 PC Release: Official Status & What We Know",
    description: "Check the current official GTA 6 PC release status, confirmed console platforms, unsupported date claims, and the sources worth watching for an announcement.",
    kicker: "Platform status tracker",
    h1: "GTA 6 PC Release Status",
    intro: "The short answer is simple: Rockstar's current GTA VI pages list PS5 and Xbox Series X|S, but no PC release date.",
    type: "Article",
    facts: [
      ["PC date", "Not announced"],
      ["Confirmed PlayStation", "PlayStation 5"],
      ["Confirmed Xbox", "Xbox Series X|S"],
    ],
    body: `
      <h2>Is GTA 6 confirmed for PC?</h2>
      <p>As of <strong>September 9, 2026</strong>, Rockstar's current GTA VI landing page and store do not list a PC version or PC release date. The named platforms are PlayStation 5 and Xbox Series X|S. “Not announced” is the accurate status; it is different from claiming a PC version is impossible.</p>
      <h2>What has Rockstar actually announced?</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Confirmed platform</span><h3>PlayStation 5</h3><p>PS5 appears on Rockstar's game and store pages. Rockstar also identifies PS5 as the capture platform for An Extended Look.</p></article>
        <article class="card"><span class="meta">Confirmed platform</span><h3>Xbox Series X|S</h3><p>Xbox Series X and Series S appear on Rockstar's current platform list and store page.</p></article>
        <article class="card"><span class="meta">Unannounced status</span><h3>Windows PC</h3><p>No PC storefront, specifications, release window, preload date, or edition listing appears on the official pages cited here.</p></article>
        <article class="card"><span class="meta">Unsupported claims</span><h3>Exact PC dates</h3><p>A date from an unattributed graphic, marketplace placeholder, social account, or prediction is not an announcement. It should be labeled as rumor unless Rockstar publishes it.</p></article>
      </div>
      <h2>Why are people expecting a PC version?</h2>
      <p>Fans often point to Rockstar's previous release patterns and the existence of earlier Grand Theft Auto games on PC. That history can explain an expectation, but it cannot supply a date for GTA 6. A real announcement would need a Rockstar-controlled page, newsroom item, store listing, or another direct statement.</p>
      <div class="callout"><strong>Tracker promise</strong><p>This page will change from “not announced” only when a first-party source changes. We will link the announcement directly and separate the announcement date from the eventual game release date.</p></div>
      <h2>How to avoid fake PC announcements</h2>
      <p>Check the exact domain, inspect whether Rockstar links to the page, and look for platform logos on the live GTA VI site. Do not download supposed launchers, “beta access,” cracked installers, or specification-checking tools shared through unofficial messages. GTA 6 has no public PC download on the official sources cited here.</p>
    `,
    faqs: [
      ["Does GTA 6 have an official PC release date?", "No official GTA 6 PC release date appears on Rockstar's current GTA VI pages as of September 9, 2026."],
      ["Which GTA 6 platforms are confirmed?", "Rockstar currently lists PlayStation 5 and Xbox Series X|S."],
      ["Does no PC announcement mean GTA 6 will never come to PC?", "No. It means Rockstar has not provided official PC release information on the cited pages yet."],
    ],
    sources: [["Official GTA VI site", officialHome], ["Rockstar Store — GTA VI", officialStore]],
  },
  {
    slug: "gta-6-vehicles",
    title: "GTA 6 Vehicles: Confirmed Cars, Boats & Bonuses",
    description: "Track officially named GTA 6 vehicles from Rockstar's store and media, including the Cheetah, Stanier, Dominator Buggy, Squalo, and more.",
    kicker: "Official vehicle tracker",
    h1: "GTA 6 Vehicles & Confirmed Names",
    intro: "A conservative vehicle index built from names Rockstar has published—not guesses based only on a blurred frame or fan-made model.",
    type: "Article",
    facts: [
      ["Pre-order vehicle", "1955 Vapid Stanier"],
      ["Ultimate vehicles", "Multiple named bonuses"],
      ["Evidence standard", "Rockstar-controlled sources"],
    ],
    body: `
      <h2>Officially named GTA 6 vehicles</h2>
      <div class="card-grid">
        <article class="card"><span class="meta">Pre-order pack</span><h3>1955 Vapid Stanier</h3><p>The Vintage Vice City pack names a 1955 Vapid Stanier sedan and includes a garage. This is one of the clearest first-party vehicle confirmations attached to an edition offer.</p></article>
        <article class="card"><span class="meta">Ultimate edition</span><h3>1995 Grotti Cheetah</h3><p>Rockstar names a 1995 Grotti Cheetah among the Ultimate Edition items. The listing confirms the vehicle name without documenting every performance or customization detail.</p></article>
        <article class="card"><span class="meta">Ultimate edition</span><h3>1967 Vapid Dominator Buggy</h3><p>The official bundle also names a 1967 Vapid Dominator Buggy, extending the published vehicle list beyond modern street cars.</p></article>
        <article class="card"><span class="meta">Ultimate edition</span><h3>Shitzu Squalo</h3><p>The Shitzu Squalo is listed in Rockstar's Ultimate Edition material, confirming at least one named watercraft in the bonus lineup.</p></article>
        <article class="card"><span class="meta">Ultimate edition</span><h3>Ganado Retro Build</h3><p>Rockstar lists a Ganado Retro Build alongside Jason-related safehouse vehicle content. The exact acquisition and upgrade flow belongs to the final game details.</p></article>
        <article class="card"><span class="meta">Ultimate edition</span><h3>Classic Car Collection</h3><p>A Classic Car Collection is named as part of the official edition offering. Treat any claimed full inventory as unconfirmed unless it appears on Rockstar's page.</p></article>
      </div>
      <h2>What about vehicles spotted in trailers?</h2>
      <p>Official footage and screenshots contain many more cars, trucks, motorcycles, boats, and aircraft than Rockstar has named in store copy. A clear visual can confirm that a vehicle design appears in marketing material, but community identification of its model name can still be an inference.</p>
      <div class="callout"><strong>Identification labels</strong><p>We use “officially named” for Rockstar's written names, “visible in official footage” for an on-screen vehicle, and “community identification” when fans match a design to a likely make or model.</p></div>
      <h2>What is not confirmed by a bonus listing?</h2>
      <p>An edition item does not by itself establish top speed, handling class, damage model, tuning depth, dealership inventory, online availability, or whether another version appears elsewhere in the world. Those details need direct documentation or final-game testing.</p>
    `,
    faqs: [
      ["What car comes with the GTA 6 pre-order?", "Rockstar lists a 1955 Vapid Stanier sedan and garage in the Vintage Vice City pre-order pack."],
      ["Is the Grotti Cheetah confirmed for GTA 6?", "Rockstar's Ultimate Edition listing names a 1995 Grotti Cheetah."],
      ["Are fan-identified trailer cars officially confirmed?", "Not necessarily. A car can be visible in official footage while its model name remains a community identification."],
    ],
    sources: [["Rockstar Store — GTA VI", officialStore], ["Official GTA VI screenshots", officialScreenshots], ["Official GTA VI videos", officialVideos]],
  },
  {
    slug: "gta-6-countdown",
    title: "GTA 6 Countdown to November 19, 2026",
    description: "Follow a live calendar countdown to the confirmed GTA 6 release date, November 19, 2026, plus preload timing and launch-status source links.",
    kicker: "Live launch tracker",
    h1: "GTA 6 Release Countdown",
    intro: "Count down to Rockstar's currently announced November 19, 2026 launch date, with the official status kept one click away.",
    type: "WebPage",
    facts: [
      ["Launch date", "November 19, 2026"],
      ["Preload date", "November 12, 2026"],
      ["Countdown basis", "Your local calendar"],
    ],
    body: `
      <h2>Time until the GTA 6 launch date</h2>
      <div class="countdown" id="release-countdown" aria-live="polite">
        <div><strong id="countdown-days">—</strong><span>Days</span></div>
        <div><strong id="countdown-hours">—</strong><span>Hours</span></div>
        <div><strong id="countdown-minutes">—</strong><span>Minutes</span></div>
        <div><strong id="countdown-seconds">—</strong><span>Seconds</span></div>
      </div>
      <p class="countdown-note" id="countdown-note">Calendar countdown to November 19 in your device's local timezone. Exact digital unlock times can vary by platform and region.</p>
      <h2>What happens before launch?</h2>
      <p>Rockstar's store currently lists <strong>November 12, 2026</strong> as the preload date. That gives eligible digital orders time to download game data before the scheduled November 19 release. Preload access is not the same thing as early gameplay access.</p>
      <div class="card-grid">
        <article class="card"><span class="meta">November 12</span><h3>Preload date</h3><p>Check storage space, system updates, account access, and the exact platform listing before downloads begin. File-size rumors are not a substitute for the figure shown by your console.</p></article>
        <article class="card"><span class="meta">November 19</span><h3>Current launch date</h3><p>Rockstar's official game page and store both display November 19, 2026. Any later change should be verified on those primary pages.</p></article>
      </div>
      <div class="callout"><strong>This is a calendar countdown</strong><p>Rockstar has announced a date, not one universal worldwide unlock timestamp on the sources cited here. The timer targets the beginning of November 19 on your device and should not be used to predict a storefront's exact unlock hour.</p></div>
      <h2>Build your launch crew now</h2>
      <p>A launch-day community is made before launch day. Use the forums to choose what you will explore first, compare official details, save favorite theories, and meet other players without waiting for the city gates to open.</p>
      <p><a class="nav-cta" href="/#categories">Join the GTA 6 launch discussion →</a></p>
    `,
    faqs: [
      ["When does GTA 6 release?", "Rockstar currently lists November 19, 2026 as the release date."],
      ["When can GTA 6 be preloaded?", "Rockstar's store currently lists November 12, 2026 as the preload date."],
      ["Is the countdown an exact unlock timer?", "No. It counts to the launch-date calendar day in your local timezone; exact store unlock times can vary."],
    ],
    sources: [["Official GTA VI site", officialHome], ["Rockstar Store — GTA VI", officialStore]],
    script: `<script>
  (() => {
    const target = new Date(2026, 10, 19, 0, 0, 0);
    const fields = {
      days: document.querySelector('#countdown-days'),
      hours: document.querySelector('#countdown-hours'),
      minutes: document.querySelector('#countdown-minutes'),
      seconds: document.querySelector('#countdown-seconds')
    };
    const note = document.querySelector('#countdown-note');
    function updateCountdown() {
      const remaining = target.getTime() - Date.now();
      if (remaining <= 0) {
        Object.values(fields).forEach((field) => { field.textContent = '00'; });
        note.textContent = 'The announced GTA 6 launch date has arrived. Check Rockstar and your platform store for current availability.';
        return;
      }
      fields.days.textContent = String(Math.floor(remaining / 86400000));
      fields.hours.textContent = String(Math.floor(remaining / 3600000) % 24).padStart(2, '0');
      fields.minutes.textContent = String(Math.floor(remaining / 60000) % 60).padStart(2, '0');
      fields.seconds.textContent = String(Math.floor(remaining / 1000) % 60).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  })();
</script>`,
  },
];

const nav = `
  <a href="${base}/gta-6-news/">News</a>
  <a href="${base}/gta-6-release-date/">Release</a>
  <a href="${base}/gta-6-gameplay/">Gameplay</a>
  <a href="${base}/gta-6-characters/">Characters</a>
  <a href="${base}/gta-6-countdown/">Countdown</a>
  <a class="nav-cta" href="${base}/#categories">Forums</a>`;

const related = pages.map((page) => ({ slug: page.slug, title: page.h1, intro: page.intro }));

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function jsonLd(page) {
  const url = `${base}/${page.slug}/`;
  const graph = [
    {
      "@type": page.type,
      "@id": `${url}#article`,
      url,
      headline: page.h1,
      name: page.h1,
      description: page.description,
      datePublished: modified,
      dateModified: modified,
      inLanguage: "en-US",
      isPartOf: { "@id": `${base}/#website` },
      publisher: { "@id": `${base}/#organization` },
      author: { "@id": `${base}/#organization` },
      about: { "@type": "VideoGame", name: "Grand Theft Auto VI", alternateName: "GTA 6", url: officialHome },
      image: `${base}/assets/og/vice-city-forums-1200x630.png`,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Vice City Forums", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: page.h1, item: url },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: "Vice City Forums",
      url: `${base}/`,
      logo: {
        "@type": "ImageObject",
        url: `${base}/assets/brand/vice-city-forums-logo-512.png`,
        width: 512,
        height: 512,
      },
    },
  ];
  if (page.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: page.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function render(page) {
  const url = `${base}/${page.slug}/`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${page.h1} | Vice City Forums`);
  const currentIndex = related.findIndex((candidate) => candidate.slug === page.slug);
  const relatedCards = [...related.slice(currentIndex + 1), ...related.slice(0, currentIndex)]
    .slice(0, 3)
    .map((candidate) => `<a class="related-card" href="${base}/${candidate.slug}/"><h3>${esc(candidate.title)}</h3><span>${esc(candidate.intro)}</span></a>`)
    .join("");
  const faqHtml = page.faqs.map(([question, answer]) => `<article class="faq-item"><h3>${esc(question)}</h3><p>${esc(answer)}</p></article>`).join("");
  const sourceHtml = page.sources.map(([label, href]) => `<li><a href="${href}" rel="noopener">${esc(label)}</a></li>`).join("");
  const facts = page.facts.map(([label, value]) => `<div class="fact"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#090611">
  <meta name="color-scheme" content="dark">
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${url}">
  <link rel="alternate" type="application/rss+xml" title="Vice City Forums — GTA 6 News" href="${base}/feed.xml">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="${["CollectionPage", "WebPage"].includes(page.type) ? "website" : "article"}">
  <meta property="og:site_name" content="Vice City Forums">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(page.title)} | Vice City Forums">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:image" content="${base}/assets/og/vice-city-forums-1200x630.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Vice City Forums — GTA 6 news, guides and community discussion">
  <meta property="article:published_time" content="${modified}">
  <meta property="article:modified_time" content="${modified}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)} | Vice City Forums">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${base}/assets/og/vice-city-forums-1200x630.png">
  <title>${esc(page.title)} | Vice City Forums</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/content.css?v=20260909-1">
  <script type="application/ld+json">${jsonLd(page)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="nav-shell">
      <a class="wordmark" href="${base}/" aria-label="Vice City Forums home"><span class="wordmark-mark">VC</span><span class="wordmark-copy"><b>VICE CITY</b><small>FORUMS · FAN COMMUNITY</small></span></a>
      <nav class="site-nav" aria-label="Primary">${nav}</nav>
    </div>
  </header>
  <main id="main" class="page-shell">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${base}/">Home</a></li><li aria-current="page">${esc(page.h1)}</li></ol></nav>
    <header class="article-hero">
      <div class="kicker">${esc(page.kicker)}</div>
      <h1>${esc(page.h1)}</h1>
      <p class="dek">${esc(page.intro)}</p>
      <time class="updated" datetime="${modified}">Verified and updated ${modifiedLabel}</time>
    </header>
    <section class="fact-grid" aria-label="Key facts">${facts}</section>
    <div class="share-bar" aria-label="Share this guide"><strong>Share</strong><a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer">X</a><a href="https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}" target="_blank" rel="noopener noreferrer">Reddit</a><a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer">Facebook</a><button type="button" data-copy-link>Copy link</button><span data-copy-status aria-live="polite"></span></div>
    <div class="content-grid">
      <article class="article-body">${page.body}<h2>Frequently asked questions</h2><div class="faq-list">${faqHtml}</div><section class="join-card"><span class="meta">Your take belongs here</span><h2>Continue the conversation</h2><p>Bring the evidence, theory, clip, or question to a real GTA 6 discussion. Reading is public; posting takes a free member profile.</p><a class="nav-cta" href="${base}/#categories">Enter Vice City Forums →</a></section></article>
      <aside class="source-box"><h2>Primary sources</h2><p>Facts on this page are checked against first-party material. Community interpretation is labeled separately.</p><ul>${sourceHtml}</ul><p><strong>Last checked:</strong><br>${modifiedLabel}</p></aside>
    </div>
    <section class="related" aria-labelledby="related-title"><h2 id="related-title">Keep exploring GTA 6</h2><div class="related-grid">${relatedCards}</div></section>
  </main>
  <footer class="site-footer"><div class="footer-shell"><nav class="footer-links" aria-label="Footer">${nav}</nav><div class="footer-note">Vice City Forums is an independent fan community and is not affiliated with, endorsed by, sponsored by, or associated with Rockstar Games or Take-Two Interactive. Grand Theft Auto and related marks belong to their respective owners.</div></div></footer>
  <script>
    document.querySelector('[data-copy-link]')?.addEventListener('click', async (event) => {
      const status = document.querySelector('[data-copy-status]');
      try {
        await navigator.clipboard.writeText(location.href);
        event.currentTarget.textContent = 'Copied';
        if (status) status.textContent = 'Link copied to clipboard.';
      } catch {
        if (status) status.textContent = 'Copy failed. Select the address from your browser.';
      }
    });
  </script>
  ${page.script || ""}
</body>
</html>`;
}

for (const page of pages) {
  const directory = resolve(root, page.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), render(page));
}

const sitemapEntries = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  ...pages.map((page) => ({ path: `/${page.slug}/`, priority: page.slug === "gta-6-news" ? "0.9" : "0.8", changefreq: page.slug === "gta-6-news" ? "daily" : "weekly" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map((entry) => `  <url><loc>${base}${entry.path}</loc><lastmod>${modified}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`).join("\n")}
</urlset>\n`;
await writeFile(resolve(root, "sitemap.xml"), sitemap);

const feedItems = pages.slice(0, 6).map((page) => `
  <item>
    <title>${esc(page.h1)}</title>
    <link>${base}/${page.slug}/</link>
    <guid isPermaLink="true">${base}/${page.slug}/</guid>
    <pubDate>Wed, 09 Sep 2026 16:00:00 GMT</pubDate>
    <description>${esc(page.description)}</description>
  </item>`).join("");
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Vice City Forums — GTA 6 News & Guides</title>
  <link>${base}/</link>
  <description>Verified GTA 6 news, guides, clips and independent community discussion.</description>
  <language>en-us</language>
  <lastBuildDate>Wed, 09 Sep 2026 16:00:00 GMT</lastBuildDate>
  <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
  ${feedItems}
</channel>
</rss>\n`;
await writeFile(resolve(root, "feed.xml"), feed);

await writeFile(resolve(root, "robots.txt"), `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /reset.html

Sitemap: ${base}/sitemap.xml
`);

await writeFile(resolve(root, "llms.txt"), `# Vice City Forums

> Independent GTA 6 fan community for verified news, official-source guides, funny clips, theories, and public discussion.

Canonical site: ${base}/
Official GTA VI source used for fact checking: ${officialHome}
Last verified: ${modified}

## Core pages
${pages.map((page) => `- [${page.h1}](${base}/${page.slug}/): ${page.description}`).join("\n")}

## Editorial policy
- Confirmed claims are tied to Rockstar-controlled or other direct first-party sources.
- Trailer observations, community theories, fan-made work, and AI-generated material are labeled distinctly.
- Unknown-provenance clips are not presented as gameplay.
- The site is fan-run and is not affiliated with Rockstar Games or Take-Two Interactive.
`);

await writeFile(resolve(root, "site.webmanifest"), JSON.stringify({
  name: "Vice City Forums",
  short_name: "VC Forums",
  description: "Independent GTA 6 news, guides, clips and community discussion.",
  start_url: "/",
  display: "standalone",
  background_color: "#080611",
  theme_color: "#090611",
  icons: [{ src: "/assets/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
}, null, 2));

const notFound = `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="theme-color" content="#090611"><title>Page Not Found | Vice City Forums</title><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="css/content.css?v=20260909-1"></head><body><main class="page-shell"><header class="article-hero" style="margin-top:48px"><div class="kicker">404 · Wrong turn</div><h1>This street is closed.</h1><p class="dek">The page moved, never existed, or took a wrong exit. Return to the GTA 6 community hub.</p><p><a class="nav-cta" href="${base}/">Return to Vice City Forums</a></p></header></main></body></html>`;
await writeFile(resolve(root, "404.html"), notFound);

console.log(`Generated ${pages.length} SEO pages plus discovery files.`);
