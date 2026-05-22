import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CircularGallery from "@/components/CircularGallery";
import Image from "next/image";

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
                alt="Whats App Image 2026 04 20 at 7 51 44 PM"
                className="w-full h-full object-cover rounded-[inherit]"
                fill
              />
            </div>

            <div className="w-full md:w-1/2 space-y-6 md:pl-8">
              <h1 className="font-serif  font-bold leading-[1.1] text-[#333C43]">
                <span className="text-5xl md:text-[60px]">
                  <span className="italic font-light">Capturing </span>
                  Timeless
                </span>
                <br />
                <span className="text-4xl text-[40px] font-light">
                  Love <span className="italic font-light">Stories</span>
                </span>
              </h1>
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
                  Get in Touch{" "}
                  <span className="ml-2 text-md tracking-normal">»</span>
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
                  Hi, I'm Aashis — a passionate wedding videographer dedicated
                  to capturing authentic, heartfelt moments. With a love for
                  natural light, elegant details, and genuine emotions, I strive
                  to create timeless photographs that tell your unique love
                  story.
                  <br />
                  <br />
                  Every couple's journey is special, and my mission is to
                  document your day in a way that feels effortless, beautiful,
                  and true to you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  url: "/assets/hero1.jpg",
                },
                {
                  url: "/assets/hero2.jpg",
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
                    alt={`gallery-${i}`}
                    className="w-full h-full object-cover"
                    fill
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
                      alt={`service-${i}`}
                      className="w-full h-full object-cover"
                      fill
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
          <div className="container mx-auto max-w-5xl">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "The Essentials",
                  price: "$1,200",
                  desc: "Perfect for intimate weddings and elopements.",
                  features: [
                    "Up to 4 hours of coverage",
                    "200+ edited high-resolution photos",
                    "Online gallery for viewing and sharing",
                    "Print release rights",
                  ],
                },
                {
                  name: "The Classic",
                  price: "$2,400",
                  desc: "Comprehensive coverage for your big day.",
                  features: [
                    "Up to 8 hours of coverage",
                    "400+ edited high-resolution photos",
                    "Online gallery + USB drive",
                    "Complimentary engagement session",
                    "Print release rights",
                  ],
                },
                {
                  name: "The Luxe",
                  price: "$3,800",
                  desc: "For couples who want it all.",
                  features: [
                    "Full-day coverage (up to 12 hours)",
                    "600+ edited high-resolution photos",
                    "Online gallery + custom USB box",
                    "Engagement session + Bridal portrait session",
                    "10x10 handcrafted wedding album",
                    "Print release rights",
                  ],
                },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className="bg-white rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl overflow-hidden flex flex-col shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-full bg-[#8697A0] py-5 text-center">
                    <h3 className="font-serif text-white italic tracking-widest text-[17px]">
                      {pkg.name}
                    </h3>
                  </div>
                  <div className="p-8 flex flex-col flex-grow text-center items-center">
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-[#333C43]">
                        {pkg.price}
                      </span>
                    </div>
                    <p className="text-[#333C43]/60 text-[11px] font-light mb-8 h-8 max-w-[200px] leading-relaxed">
                      {pkg.desc}
                    </p>
                    <ul className="space-y-4 text-left flex-grow w-full px-2">
                      {pkg.features.map((f, j) => (
                        <li
                          key={j}
                          className="text-[#333C43]/70 text-[11px] font-light flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-[#8697A0] text-[9px] mt-1">
                            ✓
                          </span>{" "}
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-10 px-6 bg-[#C4D1D4]">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row shadow-2xl bg-white rounded-sm overflow-hidden">
            {/* Left side Image placeholder */}
            <div className="w-full md:w-[45%] bg-[#7B8B94] min-h-[400px] md:min-h-full relative">
              <Image
                src="/assets/form.jpg"
                alt=""
                className="w-full h-full object-cover"
                fill
              />
            </div>

            {/* Right side form */}
            <div className="w-full md:w-[55%] p-12 md:p-14 lg:p-16">
              <h2 className="font-serif text-[38px] text-[#333C43] italic mb-3">
                Get in Touch
              </h2>
              <p className="text-[#333C43]/60 font-light text-[11px] leading-relaxed mb-10 max-w-sm">
                I'd love to hear about your special day! Please fill out the
                form below, and I'll get back to you soon.
              </p>

              <form className="space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 gap-y-7">
                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest opacity-0 hidden sm:block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                      placeholder="Last Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                      placeholder="Phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                      Wedding Date
                    </label>
                    <input
                      type="text"
                      className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                      Location / Venue
                    </label>
                    <input
                      type="text"
                      className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                      placeholder="Location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                    Which Package Are You Interested In?
                  </label>
                  <select
                    defaultValue=""
                    className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm text-[#333C43]/80"
                  >
                    <option value="" disabled hidden>
                      Select a package
                    </option>
                    <option value="The Essentials">The Essentials</option>
                    <option value="The Classic">The Classic</option>
                    <option value="The Luxe">The Luxe</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                    Message
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors resize-none text-sm placeholder:text-[#333C43]/30"
                    placeholder="Write a message..."
                  />
                </div>

                <p className="text-[10px] text-[#333C43]/50 italic font-light pt-2 pb-2">
                  Tell me a little about your vision, how you met, or any
                  details you'd like to share!
                </p>

                <Button className="w-full bg-[#F4F3ED] border-2 border-[#333C43] text-[#333C43] hover:bg-[#333C43] hover:text-[#F4F3ED] rounded-none py-6 uppercase tracking-widest text-[10px] font-semibold transition-colors shadow-none h-auto">
                  Send Inquiry
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
