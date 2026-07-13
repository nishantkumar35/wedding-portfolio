import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CircularGallery from "@/components/CircularGallery";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { StructuredData, localBusinessSchema, faqSchema } from "@/components/StructuredData";

export const revalidate = 3600;

async function getRecentPhotos() {
  try {
    await connectDB();
    const photos = await Photo.find().sort({ createdAt: -1 }).limit(10).lean();
    return JSON.parse(JSON.stringify(photos));
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return [];
  }
}

export default async function Home() {
  const recentPhotos = await getRecentPhotos();

  const galleryItems = recentPhotos.map(
    (photo: { thumbnailUrl: string; url: string; caption?: string }) => ({
      image: photo.thumbnailUrl || photo.url,
      text: photo.caption || "Wedding Moment",
    }),
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <StructuredData data={localBusinessSchema} />
      <StructuredData data={faqSchema} />
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-8 pb-8 md:pt-10 md:pb-10 px-6 overflow-hidden">
          {/* Split Background */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[30%] bg-[#C4D1D4] z-0" />
          <div className="absolute inset-y-0 right-0 w-full md:w-[70%] bg-[#FAF9F6] z-0" />

          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12 md:gap-20 relative z-10">
            <div className="w-full md:w-1/2 aspect-[4/5] bg-[#C4D1D4] rounded-tl-[60px] rounded-br-[60px] rounded-tr-xl rounded-bl-xl overflow-hidden relative shadow-md">
              <Image
                src="/assets/hero.jpeg"
                alt="Aarsh Wedding Videography - Best Wedding Videographer in Begusarai"
                className="w-full h-full object-cover rounded-[inherit]"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="w-full md:w-1/2 space-y-6 md:pl-8">
              <h1 className="sr-only">Aarsh Wedding Videography | Best Wedding Videographer in Begusarai</h1>
              <div className="font-serif  font-bold leading-[1.1] text-[#333C43]" role="heading" aria-level={2}>
                <span className="text-5xl md:text-[60px]">
                  <span className="italic font-light">Capturing </span>
                  Timeless
                </span>
                <br />
                <span className="text-4xl text-[40px] font-light">
                  Love <span className="italic font-light">Stories</span>
                </span>
              </div>
              <p className="text-[#8697A0] text-lg max-w-md font-light tracking-wide pt-2">
                Elegant Wedding Photography
                <br />
                by Aashis
              </p>
              <div className="pt-6">
                <Button
                  variant="outline"
                  className="rounded-none border-[#333C43] text-[#333C43] hover:bg-[#333C43] hover:text-white px-8 py-3 text-md uppercase tracking-widest transition-colors bg-transparent h-auto"
                >
                  <Link href={"#contact"}>
                  Get in Touch{" "}
                  <span className="ml-2 text-md tracking-normal">»</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* STORYTELLER (ABOUT) SECTION */}
        <section
          id="about"
          className="bg-[#2D3539] text-white py-10 px-5 border-b border-[#2D3539]"
        >
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-12 md:gap-20 mb-20 items-center">
              <div className="w-full md:w-5/12 text-center md:pr-12 md:border-r border-white/20">
                <h2 className="font-serif text-4xl md:text-[54px] leading-tight italic font-light text-white/90">
                  Your
                  <br />
                  storyteller
                  <br />
                  behind the
                  <br />
                  lens
                </h2>
              </div>
              <div className="w-full md:w-8/12">
                <p className="text-white/70 text-sm md:text-sm leading-loose font-light tracking-wide">
                  Hi, I'm Aashis — a passionate wedding videographer based in Begusarai, Bihar, dedicated
                  to capturing authentic, heartfelt moments. With a love for
                  natural light, elegant details, and genuine emotions, I strive
                  to create timeless cinematic films and photographs that tell your unique love
                  story.
                  <br />
                  <br />
                  Whether it's a pre-wedding shoot in Begusarai or a destination wedding, 
                  every couple's journey is special, and my mission is to
                  document your day in a way that feels effortless, beautiful,
                  and true to you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  url: "/assets/hero2.jpg",
                },
                {
                  url: "/assets/hero1.jpg",
                },
                {
                  url: "/assets/hero3.jpg",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-[#7B8B94] rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl overflow-hidden relative"
                >
                  <Image
                    src={item.url}
                    alt={`Aarsh Wedding Videography - Cinematic Wedding Films in Bihar ${i+1}`}
                    className="w-full h-full object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="py-10 px-6 bg-[#FAF9F6]">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-serif text-4xl md:text-[44px] text-[#333C43] tracking-wide">
                Photography{" "}
                <span className="italic font-light text-[#8697A0]">
                  Services
                </span>
              </h2>
              <p className="text-[#333C43]/60 max-w-2xl mx-auto font-light text-sm tracking-wide">
                Capturing every chapter of your love story with care and
                artistry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  url: "/assets/Engagement.jpg",
                  title: "Engagement\nSessions",
                  desc: "Celebrate your love with a relaxed, intimate photo session at a location special to you.",
                },
                {
                  url: "/assets/Haldi.jpeg",
                  title: "Haldi & Mehndi\nCeremonies",
                  desc: "Capture the vibrant colors, joyful traditions, and emotional moments of your pre-wedding celebrations with authentic storytelling photography.",
                },
                {
                  url: "/assets/Wedding.jpg",
                  title: "Wedding Day\nCoverage",
                  desc: "Comprehensive photography packages to beautifully document every moment — from the first look to the last dance.",
                },
                {
                  url: "/assets/Destination.jpg",
                  title: "Destination\nWeddings",
                  desc: "Wherever your love takes you, I'm ready to travel and tell your story with breathtaking images.",
                },
                {
                  url: "/assets/Albums.jpeg",
                  title: "Heirloom Albums",
                  desc: "Timeless, handcrafted albums that preserve your wedding memories for generations.",
                },
              ].map((service, i) => (
                <div
                  key={i}
                  className="bg-white rounded-tl-[40px] rounded-br-[40px] rounded-tr-md rounded-bl-md overflow-hidden flex flex-col shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] h-full"
                >
                  <div className="w-full h-50  md:h-70 aspect-[4/5] bg-[#E3E8EA] relative" >
                    <Image
                      src={service.url}
                      alt={`Aarsh Wedding Videography - ${service.title.replace('\n', ' ')}`}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow items-center text-center">
                    <h3 className="font-serif text-[17px] text-[#333C43] mb-3 whitespace-pre-line italic font-medium">
                      {service.title}
                    </h3>
                    <p className="text-[11px] text-[#333C43]/60 font-light leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAPTURED MOMENTS SECTION */}
        <section
          id="portfolio"
          className="py-10 px-6 bg-[#C4D1D4] overflow-hidden"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-5 space-y-3">
              <h2 className="font-serif text-4xl md:text-[44px] text-[#333C43] italic tracking-wide">
                Captured Moments
              </h2>
              <p className="text-[#333C43]/70 font-light tracking-wide text-sm">
                Stories Captured in Every Frame
              </p>
            </div>

            <div className="flex gap-4 overflow-hidden mb-10 justify-center">
              <div
                style={{ height: "600px", width: "100%", position: "relative" }}
              >
                <CircularGallery
                  items={galleryItems}
                  bend={0}
                  textColor="#ffffff"
                  borderRadius={0.06}
                  scrollSpeed={2}
                  scrollEase={0.05}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center ">
            <Button
              variant="outline"
              className="rounded-none border-[#333C43] text-[#333C43] hover:bg-[#333C43] hover:text-white px-10 md:px-15 py-3 text-[15px] uppercase tracking-widest transition-colors bg-transparent h-auto"
            >
              <Link href="/gallery" className="flex items-center">
                View Gallery <span className="ml-2 tracking-normal text-[15px]">»</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* PRICING PACKAGES SECTION */}
        <section id="pricing" className="py-10 px-6 bg-[#FAF9F6]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-serif text-4xl md:text-[44px] text-[#333C43] tracking-wide">
                Photography{" "}
                <span className="italic font-light text-[#8697A0]">
                  Packages
                </span>
              </h2>
              <p className="text-[#333C43]/60 max-w-2xl mx-auto font-light text-sm tracking-wide">
                Choose the Perfect Package for Your Special Day
              </p>
            </div>

            {/* Top 2 packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Traditional Package */}
              <div className="bg-white rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl overflow-hidden flex flex-col shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)]">
                <div className="w-full bg-[#8697A0] py-5 text-center">
                  <h3 className="font-serif text-white italic tracking-widest text-[17px]">Traditional Package</h3>
                  <p className="text-white/70 text-[10px] tracking-widest mt-1 uppercase">Capturing Moments, Creating Memories</p>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <ul className="space-y-3 mb-8">
                    {[
                      "Traditional Videography",
                      "Traditional Photography",
                      "Album 30 Sheets (200 Photos)",
                      "Long Length Edited Video",
                      "Pendrive",
                    ].map((s, i) => (
                      <li key={i} className="text-[#333C43]/70 text-[11px] font-light flex items-start gap-2 leading-relaxed">
                        <span className="text-[#8697A0] text-[9px] mt-1">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between border border-[#8697A0]/30 rounded-lg px-4 py-3">
                      <span className="text-[11px] text-[#333C43]/60 font-light tracking-wide">Without Drone</span>
                      <span className="text-xl font-bold text-[#333C43]">₹30,000/-</span>
                    </div>
                    <div className="flex items-center justify-between border border-[#8697A0]/30 rounded-lg px-4 py-3 bg-[#8697A0]/5">
                      <span className="text-[11px] text-[#333C43]/60 font-light tracking-wide">With Drone</span>
                      <span className="text-xl font-bold text-[#333C43]">₹35,000/-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Cinematic Package */}
              <div className="bg-[#2D3539] rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl overflow-hidden flex flex-col shadow-[0_8px_30px_-15px_rgba(0,0,0,0.2)]">
                <div className="w-full bg-[#333C43] py-5 text-center relative">
                  <span className="absolute top-3 right-4 text-[9px] uppercase tracking-widest text-[#C4D1D4]/80 border border-[#C4D1D4]/30 px-2 py-0.5 rounded-full">Popular</span>
                  <h3 className="font-serif text-white italic tracking-widest text-[17px]">Premium Cinematic Package</h3>
                  <p className="text-white/50 text-[10px] tracking-widest mt-1 uppercase">Capturing Moments, Creating Memories</p>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <ul className="space-y-3 mb-8">
                    {[
                      "Traditional Videography",
                      "Traditional Photography",
                      "Cinematic Videography (Wedding Day)",
                      "Album 50 Sheets (300 Photos)",
                      "Long Length Edited Video",
                      "Cinematic Highlight (5–7 Mins)",
                      "2–3 Reels",
                      "Pendrive",
                      "Drone Coverage",
                    ].map((s, i) => (
                      <li key={i} className="text-white/70 text-[11px] font-light flex items-start gap-2 leading-relaxed">
                        <span className="text-[#C4D1D4] text-[9px] mt-1">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto text-center border border-white/20 rounded-lg px-4 py-4">
                    <p className="text-white/50 text-[10px] tracking-widest uppercase mb-1">Package Price</p>
                    <span className="text-3xl font-bold text-white">₹50,000/-</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Event-wise Quotation */}
            <div className="bg-white rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl overflow-hidden shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)]">
              <div className="w-full bg-[#8697A0] py-5 text-center">
                <h3 className="font-serif text-white italic tracking-widest text-[17px]">Full Event-wise Quotation</h3>
                <p className="text-white/70 text-[10px] tracking-widest mt-1 uppercase">Capturing Moments, Creating Memories</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Events with pricing */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "Tilak Shagun",
                        items: [
                          { label: "Traditional Videography", price: "₹3,500/-" },
                          { label: "Traditional Photography", price: "₹3,500/-" },
                        ],
                      },
                      {
                        name: "Haldi & Mehendi",
                        items: [
                          { label: "Traditional Photography", price: "₹3,500/-" },
                          { label: "Traditional Videography", price: "₹3,500/-" },
                          { label: "Candid Photography", price: "₹5,000/-" },
                          { label: "Cinematic Videography", price: "₹7,000/-" },
                        ],
                      },
                      {
                        name: "Girdhari Matkor",
                        items: [
                          { label: "Traditional Videography", price: "₹3,500/-" },
                          { label: "Traditional Photography", price: "₹3,500/-" },
                        ],
                      },
                      {
                        name: "Wedding Day",
                        items: [
                          { label: "Traditional Videography", price: "₹3,500/-" },
                          { label: "Traditional Photography", price: "₹3,500/-" },
                          { label: "Candid Photography", price: "₹6,000/-" },
                          { label: "Cinematic Videography", price: "₹10,000/-" },
                          { label: "Drone", price: "₹5,000/-" },
                        ],
                      },
                    ].map((event, ei) => (
                      <div key={ei}>
                        <h4 className="font-serif text-[#333C43] text-[13px] italic font-medium mb-2 pb-1 border-b border-[#8697A0]/20">{event.name}</h4>
                        <ul className="space-y-1.5">
                          {event.items.map((item, ii) => (
                            <li key={ii} className="flex items-center justify-between text-[11px]">
                              <span className="text-[#333C43]/60 font-light">{item.label}</span>
                              <span className="text-[#333C43] font-medium">{item.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Post Production + What's Included + Total */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-serif text-[#333C43] text-[13px] italic font-medium mb-2 pb-1 border-b border-[#8697A0]/20">Post Production <span className="text-[10px] font-sans font-light text-[#8697A0] not-italic">(Included)</span></h4>
                      <ul className="space-y-1.5">
                        {[
                          "Premium Combo Album 50 Sheets (300 Photos)",
                          "Cinematic Edited Highlight (7–9 Mins)",
                          "Traditional Edited Video (2–3 Hrs)",
                          "Reels (3)",
                          'LED Photo Frame (12"×36")',
                          "Pendrive",
                        ].map((item, ii) => (
                          <li key={ii} className="text-[#333C43]/60 text-[11px] font-light flex items-start gap-2">
                            <span className="text-[#8697A0] text-[9px] mt-1">✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-serif text-[#333C43] text-[13px] italic font-medium mb-3 pb-1 border-b border-[#8697A0]/20">What&apos;s Included</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Photo Coverage",
                          "Video Coverage",
                          "Cinematic & Traditional Edits",
                          "Drone Coverage",
                          "Premium Album",
                          "Pendrive & LED Frame",
                        ].map((item, ii) => (
                          <div key={ii} className="flex items-center gap-1.5 text-[10px] text-[#333C43]/60 font-light">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8697A0] flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#2D3539] rounded-xl px-6 py-5 text-center">
                      <p className="text-white/50 text-[10px] tracking-widest uppercase mb-1">Package Total</p>
                      <span className="text-3xl font-bold text-white">₹86,000/-</span>
                    </div>
                  </div>
                </div>

                {/* Shared Notes */}
                <div className="border-t border-[#8697A0]/20 pt-6">
                  <ul className="flex flex-wrap gap-x-8 gap-y-2 justify-center">
                    {[
                      "All raw files will be provided.",
                      "Extra charges applicable for additional requirements.",
                      "Booking will be confirmed after advance payment.",
                      "Prices are inclusive of all applicable taxes.",
                    ].map((note, ni) => (
                      <li key={ni} className="text-[#333C43]/50 text-[10px] font-light flex items-center gap-1.5">
                        <span className="text-[#8697A0]">*</span> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
