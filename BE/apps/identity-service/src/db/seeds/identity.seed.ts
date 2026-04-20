import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';
import { SellerWebsite } from '../../domain/entities/seller_websites.entity';
import { UserRole, ProfileType } from '@app/common';
import * as bcrypt from 'bcrypt';

export class IdentitySeeder {
  async run(dataSource: DataSource): Promise<void> {
    console.log('🌱 Starting Identity Service seeding...');

    const userRepo = dataSource.getRepository(User);
    const sellerProfileRepo = dataSource.getRepository(SellerProfile);
    const sellerWebsiteRepo = dataSource.getRepository(SellerWebsite);

    await dataSource
      .createQueryBuilder()
      .delete()
      .from('seller_websites')
      .execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('seller_profiles')
      .execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('refresh_tokens')
      .execute();
    await dataSource.createQueryBuilder().delete().from('users').execute();

    console.log('✅ Cleared existing data');

    // Password hash for all test users (password: "Test1234!")
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    // ============================================
    // 1. CREATE USERS (60 users)
    // ============================================
    console.log('👤 Creating users...');

    const firstNames = [
      'Emma',
      'Liam',
      'Olivia',
      'Noah',
      'Ava',
      'Ethan',
      'Sophia',
      'Mason',
      'Isabella',
      'William',
      'Mia',
      'James',
      'Charlotte',
      'Benjamin',
      'Amelia',
      'Lucas',
      'Harper',
      'Henry',
      'Evelyn',
      'Alexander',
      'Abigail',
      'Michael',
      'Emily',
      'Daniel',
      'Elizabeth',
      'Matthew',
      'Sofia',
      'Jackson',
      'Avery',
      'Sebastian',
      'Ella',
      'Jack',
      'Scarlett',
      'Aiden',
      'Grace',
      'Owen',
      'Chloe',
      'Samuel',
      'Victoria',
      'David',
      'Riley',
      'Joseph',
      'Aria',
      'Carter',
      'Lily',
      'Wyatt',
      'Aubrey',
      'John',
      'Zoey',
      'Dylan',
      'Penelope',
      'Luke',
      'Hannah',
      'Gabriel',
      'Layla',
      'Anthony',
      'Nora',
      'Isaac',
      'Lillian',
      'Grayson',
      'Addison',
    ];

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
      'White',
      'Harris',
      'Sanchez',
      'Clark',
      'Ramirez',
      'Lewis',
      'Robinson',
      'Walker',
      'Young',
      'Allen',
      'King',
      'Wright',
      'Scott',
      'Torres',
      'Nguyen',
      'Hill',
      'Flores',
      'Green',
      'Adams',
      'Nelson',
      'Baker',
      'Hall',
      'Rivera',
      'Campbell',
      'Mitchell',
      'Carter',
      'Roberts',
      'Gomez',
      'Phillips',
      'Evans',
      'Turner',
      'Diaz',
      'Parker',
      'Cruz',
      'Edwards',
      'Collins',
      'Reyes',
    ];

    // Curated Unsplash portrait photo IDs for user avatars
    const portraitPhotos = [
      '1500648767791-00dcc994a43e',
      '1507003211169-0a1dd7228f2d',
      '1531750026848-8ada78f641c2',
      '1542909168-82c3e7fdca5c',
      '1543949806-2c9935e6aa78',
      '1549473448-b0acc73629dc',
      '1580489944761-15a19d654956',
      '1588178454780-441fa5b99fa5',
      '1595211877493-41a4e5f236b3',
      '1609436132311-e4b0c9370469',
      '1642736468842-c6bdcfbbcd28',
      '1656074520589-bd325dc7aa4f',
      '1664536392896-cd1743f9c02c',
      '1688740375397-34605b6abe48',
      '1689539137236-b68e436248de',
      '1690394943834-8f9491b750f9',
      '1486413869840-a99ac0a4c031',
      '1541519230324-f6779f9f4a48',
      '1551180452-45cc5da51c3a',
      '1570158268183-d296b2892211',
      '1584661156681-540e80a161d3',
      '1602806271931-07e449a819bd',
      '1614204424926-196a80bf0be8',
      '1625682115702-3a561cd465fd',
      '1633887091273-a3bd71efddde',
      '1650783756107-739513b38177',
      '1658048223386-e1117ffc8298',
      '1658314756268-3552b9ba2784',
      '1672860872885-d26afe731608',
      '1674643925879-d457c6e93801',
    ];

    const getPortraitUrl = (idx: number) =>
      `https://images.unsplash.com/photo-${portraitPhotos[idx % portraitPhotos.length]}?w=300&h=300&fit=crop&q=80`;

    const users: User[] = [];

    // Admin user
    users.push(
      userRepo.create({
        email: 'admin@artium.com',
        password: hashedPassword,
        fullName: 'Admin User',
        slug: 'admin',
        avatarUrl: getPortraitUrl(0),
        roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.COLLECTOR],
        isEmailVerified: true,
        isActive: true,
        lastLogin: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
      }),
    );

    // Track used slugs for uniqueness
    const usedUserSlugs = new Set<string>(['admin']);

    const generateUserSlug = (firstName: string, lastName: string, index: number): string => {
      let slug = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (usedUserSlugs.has(slug)) {
        slug = `${slug}-${index}`;
      }
      usedUserSlugs.add(slug);
      return slug;
    };

    // 30 Sellers (with SELLER role)
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const randomSuffix = Math.floor(Math.random() * 1000);

      users.push(
        userRepo.create({
          email: `seller${i + 1}@artium.com`,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          slug: generateUserSlug(firstName, lastName, i),
          avatarUrl: getPortraitUrl(i + 1),
          roles: [UserRole.SELLER, UserRole.COLLECTOR],
          isEmailVerified: i % 5 !== 0, // 80% verified
          isActive: i % 10 !== 9, // 90% active
          lastLogin:
            i % 3 === 0
              ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
              : null,
          stripeCustomerId:
            i % 2 === 0 ? `cus_${randomSuffix}${firstName}` : null,
        }),
      );
    }

    // 29 Collectors (COLLECTOR role only)
    for (let i = 30; i < 59; i++) {
      const firstName = firstNames[(i + 10) % firstNames.length];
      const lastName = lastNames[(i + 5) % lastNames.length];

      users.push(
        userRepo.create({
          email: `collector${i - 29}@artium.com`,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          slug: generateUserSlug(firstName, lastName, i),
          avatarUrl: getPortraitUrl(i),
          roles: [UserRole.COLLECTOR],
          isEmailVerified: i % 4 !== 0, // 75% verified
          isActive: true,
          lastLogin:
            i % 2 === 0
              ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
              : null,
          stripeCustomerId: i % 3 === 0 ? `cus_collector_${i}` : null,
        }),
      );
    }

    await userRepo.save(users);
    console.log(`✅ Created ${users.length} users`);

    // ============================================
    // 2. CREATE SELLER PROFILES (31 profiles - admin + 30 sellers)
    // ============================================
    console.log('🎨 Creating seller profiles...');

    const sellers = users.filter((u) => u.roles.includes(UserRole.SELLER));
    const sellerProfiles: SellerProfile[] = [];

    const profileTypes = [
      ProfileType.INDIVIDUAL,
      ProfileType.GALLERY,
      ProfileType.INSTITUTION,
    ];
    const locations = [
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'San Jose, CA',
      'Austin, TX',
      'Jacksonville, FL',
      'San Francisco, CA',
      'Columbus, OH',
      'Indianapolis, IN',
      'Seattle, WA',
      'Denver, CO',
      'Washington, DC',
      'Boston, MA',
      'Nashville, TN',
      'London, UK',
      'Paris, France',
      'Berlin, Germany',
      'Tokyo, Japan',
      'Sydney, Australia',
      'Toronto, Canada',
      'Amsterdam, Netherlands',
      'Barcelona, Spain',
      'Milan, Italy',
      'Stockholm, Sweden',
      'Copenhagen, Denmark',
    ];

    const galleryNames = [
      'Contemporary Art Space',
      'Modern Gallery',
      'Abstract Expressions',
      'Urban Art Collective',
      'Fine Arts Studio',
      'The Art Loft',
      'Creative Visions',
      'Artistic Soul',
      'Canvas & Co',
      'Palette Gallery',
      'The Studio',
      'Art House',
      'Gallery 23',
      'Spectrum Arts',
      'Artisan Collective',
      'The Creative Space',
      'Masterpiece Gallery',
      'Art & Design Co',
      "The Artist's Way",
      'Vision Gallery',
      'Chromatic Studio',
      'Horizon Arts',
      'Ember Gallery',
      'Blueprint Art Lab',
      'Reverie Arts',
      'Flux Contemporary',
      'Prism Art Space',
      'Nova Collective',
      'Aureate Gallery',
      'Catalyst Art House',
      'Meridian Studio',
    ];

    const usedSlugs = new Set<string>();
    const profileSlugs: string[] = [];

    for (let i = 0; i < sellers.length; i++) {
      const seller = sellers[i];
      const profileType = profileTypes[i % 3];
      const isGallery = profileType === ProfileType.GALLERY;
      const isInstitution = profileType === ProfileType.INSTITUTION;

      const displayName =
        isGallery || isInstitution
          ? `${galleryNames[i % galleryNames.length]}`
          : seller.fullName;

      const safeDisplayName = displayName ?? 'item';

      // Generate URL-safe slug from display name, ensure uniqueness
      let slug = safeDisplayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        || `seller-${i}`;
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${i}`;
      }
      usedSlugs.add(slug);

      const profile = new SellerProfile();
      profile.userId = seller.id;
      profile.profileType = profileType;
      profile.displayName = safeDisplayName;
      profile.bio = `${displayName} is ${isGallery ? 'a renowned gallery' : isInstitution ? 'a prestigious institution' : 'an artist'} specializing in contemporary art. With ${Math.floor(Math.random() * 15 + 5)} years of experience, ${isGallery || isInstitution ? 'we' : 'I'} bring unique perspectives to the art world.`;
      profile.profileImageUrl = seller.avatarUrl;
      profile.coverImageUrl = `https://images.unsplash.com/photo-${['1507643179773-3e975d7ac515', '1518998053901-5348d3961a04', '1565799515768-2dcfd834625c', '1569783721854-33a99b4c0bae', '1582555172866-f73bb12a2ab3', '1605429523419-d828acb941d9', '1541961017774-22349e4a1262', '1618331835717-801e976710b2', '1579783902915-f0b0de2c2eb3', '1572392640988-ba48d1a74457'][i % 10]}?w=1200&h=400&fit=crop&q=80`;
      profile.websiteUrl = i % 3 === 0 ? `https://${slug}.art` : null;
      profile.location = locations[i % locations.length];
      profile.stripeAccountId =
        i % 2 === 0 ? `acct_${slug.substring(0, 10)}` : null;
      profile.paypalMerchantId = i % 5 === 0 ? `paypal_${i}` : null;
      profile.instagramUrl =
        i % 4 !== 0 ? `https://instagram.com/${slug}` : null;
      profile.facebookUrl = i % 5 !== 0 ? `https://facebook.com/${slug}` : null;
      profile.twitterUrl = i % 6 !== 0 ? `https://twitter.com/${slug}` : null;
      profile.linkedinUrl =
        i % 7 !== 0 ? `https://linkedin.com/in/${slug}` : null;
      profile.businessRegistration =
        isGallery || isInstitution
          ? `BIZ${Math.floor(Math.random() * 1000000)}`
          : null;
      profile.taxId =
        isGallery || isInstitution
          ? `TAX${Math.floor(Math.random() * 1000000)}`
          : null;
      profile.businessAddress =
        isGallery || isInstitution
          ? {
              line1: `${Math.floor(Math.random() * 9999 + 1)} Main Street`,
              line2:
                i % 4 === 0
                  ? `Suite ${Math.floor(Math.random() * 500 + 100)}`
                  : null,
              city: locations[i % locations.length].split(',')[0],
              state:
                locations[i % locations.length].split(',')[1]?.trim() || 'NY',
              postalCode: `${Math.floor(Math.random() * 90000 + 10000)}`,
              country:
                i < 20
                  ? 'USA'
                  : locations[i % locations.length].includes('UK')
                    ? 'UK'
                    : 'USA',
            }
          : null;
      profile.businessPhone =
        isGallery || isInstitution
          ? `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
          : null;
      profile.isActive = i % 15 !== 14;
      profile.isVerified = i % 5 !== 4;
      profile.verifiedAt =
        i % 5 !== 4
          ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          : null;
      profile.stripeOnboardingComplete = i % 2 === 0;
      profile.paypalOnboardingComplete = i % 5 === 0;
      profile.soldArtworkCount = Math.floor(Math.random() * 150);
      profile.totalSales = (Math.random() * 100000).toFixed(2);
      profile.averageRating =
        i % 3 === 0 ? (Math.random() * 2 + 3).toFixed(2) : null;
      profile.isFeatured = i % 8 === 0;
      profile.metaDescription = `${displayName} - Explore unique contemporary artworks and exhibitions.`;
      profile.tagIds = [];

      profileSlugs.push(slug);
      sellerProfiles.push(profile);
    }

    await sellerProfileRepo.save(sellerProfiles);
    console.log(`✅ Created ${sellerProfiles.length} seller profiles`);

    // ============================================
    // 3. CREATE SELLER WEBSITES (80-100 websites)
    // ============================================
    console.log('🌐 Creating seller websites...');

    const websiteTypes = ['portfolio', 'shop', 'blog', 'social', 'gallery'];
    const sellerWebsites: SellerWebsite[] = [];

    for (let i = 0; i < sellerProfiles.length; i++) {
      const profile = sellerProfiles[i];
      const numWebsites = Math.floor(Math.random() * 4) + 1; // 1-4 websites per seller

      for (let j = 0; j < numWebsites; j++) {
        const websiteType = websiteTypes[j % websiteTypes.length];
        const slug = profileSlugs[i];

        sellerWebsites.push(
          sellerWebsiteRepo.create({
            sellerId: profile.id,
            websiteType,
            title: `${profile.displayName} ${websiteType.charAt(0).toUpperCase() + websiteType.slice(1)}`,
            url: `https://${slug}-${websiteType}.com`,
            description: `Official ${websiteType} of ${profile.displayName}`,
            icon: ['globe', 'shopping-bag', 'pencil', 'instagram', 'image'][
              j % 5
            ],
            displayOrder: j,
            isVisible: j < 3, // First 3 visible
          }),
        );
      }
    }

    await sellerWebsiteRepo.save(sellerWebsites);
    console.log(`✅ Created ${sellerWebsites.length} seller websites`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✨ Identity Service Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Users:           ${users.length}`);
    console.log(`🎨 Seller Profiles: ${sellerProfiles.length}`);
    console.log(`🌐 Websites:        ${sellerWebsites.length}`);
    console.log('═══════════════════════════════════════\n');
  }
}

export default IdentitySeeder;
