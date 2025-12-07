import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.enquiry.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.officeLocation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // Create Platform Admin
  console.log("Creating platform admin...");
  const platformAdminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@propertyhub.com",
      name: "Platform Admin",
      passwordHash: platformAdminPassword,
      role: "PLATFORM_ADMIN",
      isActive: true,
    },
  });

  // Create Demo Agency 1 - London Prime Estates
  console.log("Creating demo agencies...");
  const agency1 = await prisma.agency.create({
    data: {
      name: "London Prime Estates",
      slug: "london-prime-estates",
      email: "info@londonprime.co.uk",
      phone: "020 7123 4567",
      website: "https://www.londonprime.co.uk",
      addressLine1: "123 High Street",
      city: "London",
      county: "Greater London",
      postcode: "SW1A 1AA",
      country: "United Kingdom",
      logoUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop",
      heroImageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=600&fit=crop",
      primaryColor: "#1e3a5f",
      secondaryColor: "#0d2137",
      accentColor: "#d4a574",
      status: "ACTIVE",
      planTier: "professional",
      maxProperties: 100,
      maxUsers: 10,
    },
  });

  // Create Demo Agency 2 - Manchester Homes
  const agency2 = await prisma.agency.create({
    data: {
      name: "Manchester Homes",
      slug: "manchester-homes",
      email: "hello@manchesterhomes.co.uk",
      phone: "0161 234 5678",
      addressLine1: "456 Deansgate",
      city: "Manchester",
      county: "Greater Manchester",
      postcode: "M3 2BQ",
      country: "United Kingdom",
      primaryColor: "#dc2626",
      secondaryColor: "#991b1b",
      accentColor: "#fbbf24",
      status: "ACTIVE",
      planTier: "starter",
      maxProperties: 25,
      maxUsers: 5,
    },
  });

  // Create users for Agency 1
  console.log("Creating agency users...");
  const agency1AdminPassword = await bcrypt.hash("password123", 12);
  const agency1Admin = await prisma.user.create({
    data: {
      email: "admin@londonprime.co.uk",
      name: "James Wilson",
      passwordHash: agency1AdminPassword,
      role: "AGENCY_ADMIN",
      agencyId: agency1.id,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "agent@londonprime.co.uk",
      name: "Sarah Parker",
      passwordHash: agency1AdminPassword,
      role: "AGENT",
      agencyId: agency1.id,
      isActive: true,
    },
  });

  // Create users for Agency 2
  const agency2AdminPassword = await bcrypt.hash("password123", 12);
  await prisma.user.create({
    data: {
      email: "admin@manchesterhomes.co.uk",
      name: "Michael Brown",
      passwordHash: agency2AdminPassword,
      role: "AGENCY_ADMIN",
      agencyId: agency2.id,
      isActive: true,
    },
  });

  // Sample property images from Unsplash
  const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop",
  ];

  // Create properties for Agency 1 (London)
  console.log("Creating demo properties...");
  const londonProperties = [
    {
      title: "Stunning 4 Bedroom Victorian Townhouse",
      description: `This exceptional Victorian townhouse offers the perfect blend of period charm and modern living. Spread across four floors, the property features original features including high ceilings, ornate cornicing, and working fireplaces.

The ground floor comprises a welcoming entrance hall, a spacious double reception room with bay windows, and a modern kitchen-diner that opens onto a private garden. The first floor houses the master bedroom with en-suite bathroom and a second double bedroom. Two further bedrooms and a family bathroom occupy the second floor.

Key highlights include a beautifully landscaped south-facing garden, off-street parking, and proximity to excellent schools and transport links.`,
      status: "FOR_SALE" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "24 Belgravia Square",
      city: "London",
      county: "Greater London",
      postcode: "SW1X 8PZ",
      latitude: 51.4994,
      longitude: -0.1526,
      price: 2450000,
      priceType: "FIXED" as const,
      propertyType: "TOWNHOUSE" as const,
      bedrooms: 4,
      bathrooms: 3,
      receptions: 2,
      tenure: "FREEHOLD" as const,
      floorAreaSqFt: 2850,
      epcRating: "C" as const,
      councilTaxBand: "H",
      yearBuilt: 1875,
      hasGarden: true,
      hasParking: true,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      keyFeatures: [
        "Period features throughout",
        "South-facing garden",
        "Off-street parking",
        "Original fireplaces",
        "Close to Hyde Park",
      ],
      isPublished: true,
      isFeatured: true,
    },
    {
      title: "Modern 2 Bed Apartment with River Views",
      description: `A stunning two-bedroom apartment in this prestigious riverside development, offering spectacular views of the Thames and Tower Bridge.

The open-plan living area features floor-to-ceiling windows, a designer kitchen with integrated Miele appliances, and a private balcony perfect for al fresco dining. Both bedrooms are generously sized with built-in wardrobes, and the master benefits from a luxury en-suite shower room.

Residents enjoy access to a 24-hour concierge, gym, residents' lounge, and beautifully landscaped communal gardens. Underground parking is included.`,
      status: "FOR_SALE" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "One Tower Bridge",
      addressLine2: "Apartment 1205",
      city: "London",
      county: "Greater London",
      postcode: "SE1 2UP",
      latitude: 51.5045,
      longitude: -0.0782,
      price: 1875000,
      priceType: "FIXED" as const,
      propertyType: "APARTMENT" as const,
      bedrooms: 2,
      bathrooms: 2,
      receptions: 1,
      tenure: "LEASEHOLD" as const,
      floorAreaSqFt: 1150,
      epcRating: "B" as const,
      councilTaxBand: "G",
      yearBuilt: 2018,
      hasGarden: false,
      hasParking: true,
      hasGarage: false,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      keyFeatures: [
        "River and Tower Bridge views",
        "24-hour concierge",
        "Underground parking",
        "Gym and residents' lounge",
        "Designer kitchen",
      ],
      isPublished: true,
      isFeatured: true,
    },
    {
      title: "Charming 3 Bedroom Cottage in Hampstead",
      description: `A delightful period cottage tucked away in one of Hampstead's most sought-after lanes. This enchanting property combines village charm with modern convenience.

The cottage offers a cosy sitting room with exposed beams and a wood-burning stove, a separate dining room, and a recently updated kitchen. Upstairs, three bedrooms and a modern bathroom provide comfortable family accommodation.

The pretty cottage garden includes a patio area, mature shrubs, and a useful garden shed. Hampstead Village with its boutiques, cafes, and the famous Heath is just moments away.`,
      status: "FOR_SALE" as const,
      availabilityStatus: "UNDER_OFFER" as const,
      addressLine1: "3 Flask Walk",
      city: "London",
      county: "Greater London",
      postcode: "NW3 1HE",
      latitude: 51.5576,
      longitude: -0.1776,
      price: 1650000,
      priceType: "OFFERS_OVER" as const,
      propertyType: "COTTAGE" as const,
      bedrooms: 3,
      bathrooms: 1,
      receptions: 2,
      tenure: "FREEHOLD" as const,
      floorAreaSqFt: 1200,
      epcRating: "D" as const,
      councilTaxBand: "F",
      yearBuilt: 1820,
      hasGarden: true,
      hasParking: false,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      keyFeatures: [
        "Period cottage charm",
        "Wood-burning stove",
        "Private garden",
        "Hampstead Village location",
        "Close to Heath",
      ],
      isPublished: true,
      isFeatured: false,
    },
    {
      title: "Luxury Penthouse with Panoramic City Views",
      description: `An exceptional penthouse apartment occupying the entire top floor of this landmark building, offering 360-degree views across London's iconic skyline.

The vast open-plan living space features a bespoke kitchen, multiple seating areas, and a formal dining zone. Four bedroom suites, each with en-suite facilities, provide luxurious accommodation. The property also includes a private study, utility room, and extensive storage.

Two wrap-around terraces offer uninterrupted views from the Shard to St Paul's Cathedral. Underground parking for two vehicles and a dedicated concierge service complete this extraordinary home.`,
      status: "FOR_SALE" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "Penthouse, The Residence",
      addressLine2: "Nine Elms Lane",
      city: "London",
      county: "Greater London",
      postcode: "SW8 5BN",
      latitude: 51.4823,
      longitude: -0.1278,
      price: 5500000,
      priceType: "POA" as const,
      propertyType: "APARTMENT" as const,
      bedrooms: 4,
      bathrooms: 4,
      receptions: 2,
      tenure: "LEASEHOLD" as const,
      floorAreaSqFt: 4200,
      epcRating: "A" as const,
      councilTaxBand: "H",
      yearBuilt: 2022,
      parkingSpaces: 2,
      hasGarden: false,
      hasParking: true,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      keyFeatures: [
        "360-degree London views",
        "Wrap-around terraces",
        "Four en-suite bedrooms",
        "Two parking spaces",
        "Concierge service",
      ],
      isPublished: true,
      isFeatured: true,
    },
    {
      title: "Spacious 1 Bed Flat to Let in Shoreditch",
      description: `A stylish one-bedroom apartment in the heart of trendy Shoreditch, perfect for young professionals seeking a vibrant city lifestyle.

The property features a bright open-plan living area with a modern fitted kitchen, a comfortable double bedroom with built-in storage, and a contemporary bathroom with rain shower.

Located above a popular independent coffee shop, you're moments from the best of Shoreditch's restaurants, bars, and creative spaces. Excellent transport links via Liverpool Street and Old Street stations.`,
      status: "TO_RENT" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "15 Redchurch Street",
      addressLine2: "Flat 3",
      city: "London",
      county: "Greater London",
      postcode: "E2 7DJ",
      latitude: 51.5234,
      longitude: -0.0728,
      price: 2200,
      priceType: "PCM" as const,
      propertyType: "FLAT" as const,
      bedrooms: 1,
      bathrooms: 1,
      receptions: 1,
      tenure: "NOT_SPECIFIED" as const,
      furnishedStatus: "FURNISHED" as const,
      floorAreaSqFt: 550,
      epcRating: "C" as const,
      yearBuilt: 2015,
      hasGarden: false,
      hasParking: false,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      petsAllowed: false,
      keyFeatures: [
        "Prime Shoreditch location",
        "Fully furnished",
        "Modern throughout",
        "Great transport links",
        "Vibrant neighbourhood",
      ],
      isPublished: true,
      isFeatured: false,
    },
  ];

  // Create properties and images for Agency 1
  for (let i = 0; i < londonProperties.length; i++) {
    const propData = londonProperties[i];
    const property = await prisma.property.create({
      data: {
        ...propData,
        agencyId: agency1.id,
        slug: propData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
    });

    // Add 3-4 images per property
    const numImages = 3 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numImages; j++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: propertyImages[(i + j) % propertyImages.length],
          altText: `${propData.title} - Image ${j + 1}`,
          sortOrder: j,
          isPrimary: j === 0,
        },
      });
    }
  }

  // Create properties for Agency 2 (Manchester)
  const manchesterProperties = [
    {
      title: "Contemporary 3 Bed Family Home",
      description: `A beautifully presented three-bedroom family home in a popular Chorlton location. The property has been extensively modernized while retaining its original character.

The ground floor features a bright living room, separate dining room, and a stunning kitchen extension with bi-fold doors to the garden. Upstairs, three good-sized bedrooms and a modern family bathroom provide comfortable family accommodation.

The south-facing rear garden is a particular highlight, featuring a large patio, established borders, and a useful garden office/studio.`,
      status: "FOR_SALE" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "45 Beech Road",
      city: "Manchester",
      county: "Greater Manchester",
      postcode: "M21 9EQ",
      latitude: 53.4385,
      longitude: -2.2802,
      price: 425000,
      priceType: "FIXED" as const,
      propertyType: "SEMI_DETACHED" as const,
      bedrooms: 3,
      bathrooms: 1,
      receptions: 2,
      tenure: "FREEHOLD" as const,
      floorAreaSqFt: 1350,
      epcRating: "C" as const,
      councilTaxBand: "D",
      yearBuilt: 1930,
      hasGarden: true,
      hasParking: true,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      keyFeatures: [
        "Extended and modernized",
        "Garden office/studio",
        "South-facing garden",
        "Popular Chorlton location",
        "Close to amenities",
      ],
      isPublished: true,
      isFeatured: true,
    },
    {
      title: "City Centre 2 Bed Apartment with Parking",
      description: `A modern two-bedroom apartment in the heart of Manchester city centre, ideal for professionals or investors.

The property offers open-plan living with a sleek kitchen, two double bedrooms (master with en-suite), and a contemporary main bathroom. The apartment also benefits from a private balcony with city views.

Secure underground parking and access to a residents' gym are included. Located within walking distance of Deansgate, Spinningfields, and Northern Quarter.`,
      status: "TO_RENT" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "City Tower",
      addressLine2: "Apartment 708",
      city: "Manchester",
      county: "Greater Manchester",
      postcode: "M3 3AQ",
      latitude: 53.4808,
      longitude: -2.2426,
      price: 1450,
      priceType: "PCM" as const,
      propertyType: "APARTMENT" as const,
      bedrooms: 2,
      bathrooms: 2,
      receptions: 1,
      tenure: "NOT_SPECIFIED" as const,
      furnishedStatus: "UNFURNISHED" as const,
      floorAreaSqFt: 850,
      epcRating: "B" as const,
      yearBuilt: 2019,
      hasGarden: false,
      hasParking: true,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      petsAllowed: false,
      keyFeatures: [
        "City centre location",
        "Secure parking",
        "Residents' gym",
        "Private balcony",
        "Modern specification",
      ],
      isPublished: true,
      isFeatured: true,
    },
    {
      title: "Victorian 4 Bed Terrace in Didsbury",
      description: `An impressive four-bedroom Victorian terrace in the sought-after Didsbury Village. This characterful home retains many original features while offering modern family living.

The accommodation includes a grand entrance hall, two reception rooms, and an extended kitchen-diner. Four bedrooms on the first and second floors provide flexible family accommodation, served by a family bathroom and separate WC.

The mature rear garden features a patio, lawn, and established planting. On-street permit parking available.`,
      status: "FOR_SALE" as const,
      availabilityStatus: "AVAILABLE" as const,
      addressLine1: "28 Palatine Road",
      city: "Manchester",
      county: "Greater Manchester",
      postcode: "M20 3JJ",
      latitude: 53.4162,
      longitude: -2.2279,
      price: 595000,
      priceType: "OFFERS_REGION" as const,
      propertyType: "TERRACED" as const,
      bedrooms: 4,
      bathrooms: 1,
      receptions: 2,
      tenure: "FREEHOLD" as const,
      floorAreaSqFt: 1650,
      epcRating: "D" as const,
      councilTaxBand: "E",
      yearBuilt: 1895,
      hasGarden: true,
      hasParking: false,
      hasCentralHeating: true,
      hasDoubleGlazing: true,
      keyFeatures: [
        "Didsbury Village location",
        "Period features",
        "Extended kitchen-diner",
        "Mature rear garden",
        "Four bedrooms",
      ],
      isPublished: true,
      isFeatured: false,
    },
  ];

  // Create properties and images for Agency 2
  for (let i = 0; i < manchesterProperties.length; i++) {
    const propData = manchesterProperties[i];
    const property = await prisma.property.create({
      data: {
        ...propData,
        agencyId: agency2.id,
        slug: propData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
    });

    // Add images
    const numImages = 3 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numImages; j++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: propertyImages[(i + j + 3) % propertyImages.length],
          altText: `${propData.title} - Image ${j + 1}`,
          sortOrder: j,
          isPrimary: j === 0,
        },
      });
    }
  }

  // Create sample enquiries
  console.log("Creating sample enquiries...");
  const properties = await prisma.property.findMany({
    take: 4,
    include: { agency: true },
  });

  const enquiryData = [
    {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "07700 900123",
      message: "I'm very interested in this property. Could you arrange a viewing for this weekend? I'm a first-time buyer with a mortgage agreement in principle.",
      status: "NEW" as const,
    },
    {
      name: "Emma Johnson",
      email: "emma.j@email.com",
      phone: "07700 900456",
      message: "This property looks perfect for our family. We're looking to move in the next 3 months. Is the price negotiable?",
      status: "IN_PROGRESS" as const,
    },
    {
      name: "David Williams",
      email: "d.williams@email.com",
      message: "Could you send me the floor plan and EPC certificate? Also interested to know about local schools.",
      status: "RESPONDED" as const,
    },
  ];

  for (let i = 0; i < Math.min(enquiryData.length, properties.length); i++) {
    await prisma.enquiry.create({
      data: {
        ...enquiryData[i],
        propertyId: properties[i].id,
        agencyId: properties[i].agencyId,
        source: "website",
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("\n=== Demo Accounts ===");
  console.log("Platform Admin:");
  console.log("  Email: admin@propertyhub.com");
  console.log("  Password: admin123");
  console.log("\nAgency 1 (London Prime Estates):");
  console.log("  Admin Email: admin@londonprime.co.uk");
  console.log("  Agent Email: agent@londonprime.co.uk");
  console.log("  Password: password123");
  console.log("  Public URL: /agency/london-prime-estates");
  console.log("\nAgency 2 (Manchester Homes):");
  console.log("  Admin Email: admin@manchesterhomes.co.uk");
  console.log("  Password: password123");
  console.log("  Public URL: /agency/manchester-homes");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
