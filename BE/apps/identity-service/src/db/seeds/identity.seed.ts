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

    const users: User[] = [];

    // Admin user
    users.push(
      userRepo.create({
        email: 'admin@artium.com',
        password: hashedPassword,
        fullName: 'Admin User',
        avatarUrl: 'https://i.pravatar.cc/300?img=1',
        roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.COLLECTOR],
        isEmailVerified: true,
        isActive: true,
        lastLogin: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
      }),
    );

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
          avatarUrl: `https://i.pravatar.cc/300?img=${i + 10}`,
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
          avatarUrl: `https://i.pravatar.cc/300?img=${i + 20}`,
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
      `The Artist\\'s Way`,
      'Vision Gallery',
    ];

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

      // Generate URL-safe slug from display name
      const slug = safeDisplayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        || `seller-${i}`;

      const profile = new SellerProfile();
      profile.userId = seller.id;
      profile.profileType = profileType;
      profile.displayName = safeDisplayName;
      profile.slug = slug;
      profile.bio = `${displayName} is ${isGallery ? 'a renowned gallery' : isInstitution ? 'a prestigious institution' : 'an artist'} specializing in contemporary art. With ${Math.floor(Math.random() * 15 + 5)} years of experience, ${isGallery || isInstitution ? 'we' : 'I'} bring unique perspectives to the art world.`;
      profile.profileImageUrl = seller.avatarUrl;
      profile.coverImageUrl = `https://picsum.photos/seed/${slug}/1200/400`;
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
        const slug = profile.slug;

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
