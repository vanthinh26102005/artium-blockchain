import { DataSource } from 'typeorm';
import { Artwork } from '../../domain/entities/artworks.entity';
import { ArtworkFolder } from '../../domain/entities/artwork-folder.entity';
import { Tag } from '../../domain/entities/tags.entity';
import { ArtworkTag } from '../../domain/entities/artwork-tag.entity';
import { ArtworkComment } from '../../domain/entities/artwork-comment.entity';
import { ArtworkCommentLike } from '../../domain/entities/artwork-comment-like.entity';
import { ArtworkLike } from '../../domain/entities/artwork-like.entity';
import { ArtworkStatus, TagStatus } from '@app/common';

export class ArtworkSeeder {
  async run(
    dataSource: DataSource,
    userIds: string[],
    sellerIds: string[],
  ): Promise<void> {
    console.log('🎨 Starting Artwork Service seeding...');

    const artworkRepo = dataSource.getRepository(Artwork);
    const folderRepo = dataSource.getRepository(ArtworkFolder);
    const tagRepo = dataSource.getRepository(Tag);
    const artworkTagRepo = dataSource.getRepository(ArtworkTag);
    const commentRepo = dataSource.getRepository(ArtworkComment);
    const commentLikeRepo = dataSource.getRepository(ArtworkCommentLike);
    const artworkLikeRepo = dataSource.getRepository(ArtworkLike);

    // Clear existing data (in reverse order of dependencies)
    // Using query builder to delete all records (avoids TRUNCATE constraint issues)
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('artwork_likes')
      .execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('artwork_comment_likes')
      .execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('artwork_comments')
      .execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('artwork_tags')
      .execute();
    await dataSource.createQueryBuilder().delete().from('artworks').execute();
    await dataSource.createQueryBuilder().delete().from('tags').execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from('artwork_folders')
      .execute();

    console.log('✅ Cleared existing artwork data');

    // ============================================
    // 1. CREATE TAGS (60 tags: 20 system, 40 custom)
    // ============================================
    console.log('🏷️  Creating tags...');

    const systemTagNames = [
      'Abstract',
      'Contemporary',
      'Modern',
      'Classical',
      'Minimalist',
      'Expressionism',
      'Surrealism',
      'Pop Art',
      'Street Art',
      'Digital Art',
      'Photography',
      'Sculpture',
      'Oil Painting',
      'Watercolor',
      'Acrylic',
      'Mixed Media',
      'Conceptual',
      'Figurative',
      'Landscape',
      'Portrait',
    ];

    const customTagNames = [
      'Nature',
      'Urban',
      'Colorful',
      'Monochrome',
      'Vibrant',
      'Serene',
      'Bold',
      'Subtle',
      'Geometric',
      'Organic',
      'Textured',
      'Smooth',
      'Large Scale',
      'Miniature',
      'Series',
      'Limited Edition',
      'One of a Kind',
      'Framed',
      'Unframed',
      'Ready to Hang',
      'Coastal',
      'Mountain',
      'City Life',
      'Wildlife',
      'Floral',
      'Nautical',
      'Industrial',
      'Vintage',
      'Futuristic',
      'Mystical',
      'Peaceful',
      'Energetic',
      'Dark',
      'Light',
      'Warm Tones',
      'Cool Tones',
      'Neutral',
      'Pastel',
      'Neon',
      'Earth Tones',
    ];

    const tags: Tag[] = [];

    // System tags
    for (let i = 0; i < systemTagNames.length; i++) {
      tags.push(
        tagRepo.create({
          name: systemTagNames[i],
          status: TagStatus.SYSTEM,
          sellerId: null,
        }),
      );
    }

    // Custom tags (distributed across sellers)
    for (let i = 0; i < customTagNames.length; i++) {
      tags.push(
        tagRepo.create({
          name: customTagNames[i],
          status: TagStatus.CUSTOM,
          sellerId: sellerIds[i % sellerIds.length],
        }),
      );
    }

    await tagRepo.save(tags);
    console.log(`✅ Created ${tags.length} tags`);

    // ============================================
    // 2. CREATE ARTWORKS (200 artworks) - Created first without folder assignment
    // ============================================
    console.log('🖼️  Creating artworks...');

    const artworkTitles = [
      'Sunset Symphony',
      'Urban Dreams',
      'Peaceful Harbor',
      'Mountain Majesty',
      'Abstract Thoughts',
      'City Lights',
      'Ocean Waves',
      'Desert Bloom',
      'Forest Whispers',
      'Starry Night',
      'Golden Hour',
      'Misty Morning',
      'Autumn Leaves',
      'Spring Awakening',
      'Winter Solitude',
      'Summer Breeze',
      'Dancing Colors',
      'Silent Echoes',
      'Vibrant Life',
      'Tranquil Mind',
      'Bold Statement',
      'Subtle Beauty',
      'Dynamic Energy',
      'Calm Waters',
      'Rising Dawn',
      'Fading Light',
      'Endless Horizon',
      'Hidden Depths',
      'Flowing Forms',
      'Geometric Harmony',
      'Natural Balance',
      'Urban Jungle',
      'Cosmic Journey',
      'Earth Elements',
      'Fire & Ice',
      'Wind & Water',
      'Light & Shadow',
      'Day & Night',
      'Past & Future',
      'Here & Now',
    ];

    const materials = [
      'Oil on canvas',
      'Acrylic on canvas',
      'Watercolor on paper',
      'Mixed media',
      'Digital print',
      'Photography',
      'Charcoal on paper',
      'Pastel on paper',
      'Ink on paper',
      'Spray paint on canvas',
      'Collage',
      'Encaustic',
    ];

    const locations = [
      'New York',
      'Los Angeles',
      'Chicago',
      'Miami',
      'San Francisco',
      'London',
      'Paris',
      'Berlin',
      'Tokyo',
      'Sydney',
    ];

    const artworks: Artwork[] = [];

    for (let i = 0; i < 200; i++) {
      const sellerId = sellerIds[i % sellerIds.length];
      const title = `${artworkTitles[i % artworkTitles.length]}${i >= artworkTitles.length ? ` ${Math.floor(i / artworkTitles.length) + 1}` : ''}`;
      const material = materials[i % materials.length];

      const width = Math.floor(Math.random() * 150 + 30); // 30-180 cm
      const height = Math.floor(Math.random() * 150 + 30);
      const hasDepth = i % 5 === 0; // 20% have depth (sculptures)
      const depth = hasDepth ? Math.floor(Math.random() * 30 + 5) : null;

      const price = Math.floor(Math.random() * 10000 + 500); // $500-$10,500
      const status = [
        ArtworkStatus.DRAFT,
        ArtworkStatus.ACTIVE,
        ArtworkStatus.ACTIVE,
        ArtworkStatus.ACTIVE,
        ArtworkStatus.SOLD,
        ArtworkStatus.RESERVED,
        ArtworkStatus.PENDING_REVIEW,
      ][i % 7];

      artworks.push(
        artworkRepo.create({
          sellerId,
          creatorName: `Artist ${(i % sellerIds.length) + 1}`,
          title,
          description: `${title} is a ${material.toLowerCase()} piece that explores themes of ${['nature', 'urban life', 'emotion', 'memory', 'time', 'space'][i % 6]}. This ${['stunning', 'captivating', 'thought-provoking', 'beautiful', 'striking', 'mesmerizing'][i % 6]} work measures ${width} x ${height}${hasDepth ? ` x ${depth}` : ''} cm and would make an excellent addition to any collection.`,
          creationYear: 2024 - Math.floor(Math.random() * 10), // 2014-2024
          editionRun:
            i % 4 === 0 ? `${Math.floor(Math.random() * 10 + 1)}/100` : null,
          dimensions: {
            width,
            height,
            unit: 'cm',
          },
          weight:
            i % 3 === 0
              ? {
                  value: Math.floor(Math.random() * 50 + 1),
                  unit: 'kg',
                }
              : null,
          materials: material,
          location: locations[i % locations.length],
          price: price.toString(),
          currency: 'USD',
          quantity:
            status === ArtworkStatus.SOLD
              ? 0
              : Math.floor(Math.random() * 5 + 1),
          status,
          isPublished:
            status === ArtworkStatus.ACTIVE || status === ArtworkStatus.SOLD,
          images: [
            {
              id: `img_${i}_1`,
              publicId: `artworks/${sellerId}/${title.toLowerCase().replace(/\s+/g, '-')}-1`,
              url: `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/800/600`,
              secureUrl: `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/800/600`,
              format: 'jpg',
              width: 800,
              height: 600,
              size: Math.floor(Math.random() * 500000 + 100000),
              bucket: 'artium-artworks',
              createdAt: new Date(),
              order: 0,
              isPrimary: true,
            },
            ...(i % 3 === 0
              ? [
                  {
                    id: `img_${i}_2`,
                    publicId: `artworks/${sellerId}/${title.toLowerCase().replace(/\s+/g, '-')}-2`,
                    url: `https://picsum.photos/seed/${title.replace(/\s+/g, '')}2/800/600`,
                    secureUrl: `https://picsum.photos/seed/${title.replace(/\s+/g, '')}2/800/600`,
                    format: 'jpg',
                    width: 800,
                    height: 600,
                    size: Math.floor(Math.random() * 500000 + 100000),
                    bucket: 'artium-artworks',
                    createdAt: new Date(),
                    order: 1,
                    isPrimary: false,
                  },
                ]
              : []),
          ],
          // folder assigned later after folders are created
          viewCount: Math.floor(Math.random() * 1000),
          likeCount: Math.floor(Math.random() * 100),
          commentCount: Math.floor(Math.random() * 50),
          moodboardCount: Math.floor(Math.random() * 20),
        }),
      );
    }

    await artworkRepo.save(artworks);
    console.log(`✅ Created ${artworks.length} artworks`);

    // ============================================
    // 3. CREATE ARTWORK FOLDERS (55 folders) - Created after artworks
    // ============================================
    console.log('📁 Creating artwork folders...');

    const folderNames = [
      'New Releases',
      'Gallery Picks',
      'Collector Hold',
      'Studio Drafts',
      'Archived Works',
      'Press Kit',
      'Featured Collection',
      'Private Collection',
      'Exhibition Ready',
      'Commission Works',
      'Personal Favorites',
      'In Progress',
      'Sold Works',
      'Available Now',
      'Limited Editions',
      'Prints',
      'Original Paintings',
      'Sculptures',
      'Digital Works',
      'Photography Portfolio',
      'Abstract Series',
      'Landscape Collection',
      'Portrait Gallery',
      'Urban Scenes',
      'Nature Studies',
      'Color Experiments',
      'Black & White',
      'Mixed Media Projects',
    ];

    const folders: ArtworkFolder[] = [];

    for (let i = 0; i < 55; i++) {
      const sellerId = sellerIds[i % sellerIds.length];
      const folderName = `${folderNames[i % folderNames.length]}${i >= folderNames.length ? ` ${Math.floor(i / folderNames.length) + 1}` : ''}`;

      folders.push(
        folderRepo.create({
          sellerId,
          name: folderName,
          position: i % 10, // 0-9 positions
          isHidden: i % 20 === 19, // 5% hidden
          parent: null, // Flat structure for now
        }),
      );
    }

    await folderRepo.save(folders);
    console.log(`✅ Created ${folders.length} folders`);

    // ============================================
    // 4. ASSIGN ARTWORKS TO FOLDERS (75% of artworks get assigned)
    // ============================================
    console.log('🔗 Assigning artworks to folders...');

    let assignedCount = 0;
    for (let i = 0; i < artworks.length; i++) {
      if (i % 4 !== 0) {
        // 75% in folders
        const artwork = artworks[i];

        // Only assign to folders that belong to the same seller
        const sellerFolders = folders.filter(
          (f) => f.sellerId === artwork.sellerId,
        );
        if (sellerFolders.length > 0) {
          artwork.folder = sellerFolders[i % sellerFolders.length];
          assignedCount++;
        }
      }
    }

    await artworkRepo.save(artworks);
    console.log(`✅ Assigned ${assignedCount} artworks to folders`);

    // ============================================
    // 5. CREATE ARTWORK-TAG RELATIONSHIPS (400+ relationships)
    // ============================================
    console.log('🔗 Creating artwork-tag relationships...');

    const artworkTags: ArtworkTag[] = [];

    for (const artwork of artworks) {
      // Each artwork gets 2-5 tags
      const numTags = Math.floor(Math.random() * 4) + 2;
      const selectedTags = new Set<Tag>();

      while (selectedTags.size < numTags) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        selectedTags.add(randomTag);
      }

      for (const tag of selectedTags) {
        artworkTags.push(
          artworkTagRepo.create({
            artwork,
            tag,
          }),
        );
      }
    }

    await artworkTagRepo.save(artworkTags);
    console.log(`✅ Created ${artworkTags.length} artwork-tag relationships`);

    // ============================================
    // 6. CREATE ARTWORK COMMENTS (150 comments)
    // ============================================
    console.log('💬 Creating artwork comments...');

    const commentTexts = [
      'This is absolutely stunning! The colors really speak to me.',
      'Beautiful work! I love the composition.',
      'Amazing piece! How long did this take to create?',
      'This would look perfect in my living room!',
      'The detail is incredible. True craftsmanship.',
      "I'm speechless. This is art at its finest.",
      'Love the use of light and shadow here.',
      'This piece has such a unique perspective.',
      'The texture is mesmerizing. Well done!',
      'Such a powerful statement. Bravo!',
      'I can feel the emotion in every brushstroke.',
      'This takes my breath away.',
      'Incredible talent! Following for more.',
      'The color palette is perfect.',
      'This is going on my wishlist!',
      'Such depth and meaning in this work.',
      'Outstanding! One of my favorites.',
      'The technique here is masterful.',
      'This speaks to my soul.',
      'Absolutely captivating artwork!',
    ];

    const comments: ArtworkComment[] = [];
    const publishedArtworks = artworks.filter((a) => a.isPublished);

    for (let i = 0; i < 150; i++) {
      const artwork = publishedArtworks[i % publishedArtworks.length];
      const userId = userIds[i % userIds.length];
      const commentText = commentTexts[i % commentTexts.length];

      comments.push(
        commentRepo.create({
          userId,
          artwork,
          sellerId: artwork.sellerId,
          parent: null,
          content: commentText,
          mediaUrl:
            i % 10 === 0
              ? `https://picsum.photos/seed/comment${i}/400/300`
              : null,
          mentionedUserIds:
            i % 5 === 0 ? [userIds[(i + 1) % userIds.length]] : [],
          likeCount: Math.floor(Math.random() * 20),
          replyCount: 0,
          isEdited: i % 8 === 0,
          editedAt:
            i % 8 === 0
              ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
              : null,
          isDeleted: i % 50 === 49, // 2% deleted
          deletedAt:
            i % 50 === 49
              ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
              : null,
          isFlagged: i % 100 === 99, // 1% flagged
        }),
      );
    }

    await commentRepo.save(comments);
    console.log(`✅ Created ${comments.length} comments`);

    // Create 50 reply comments (nested)
    const replyComments: ArtworkComment[] = [];
    const topLevelComments = comments.filter((c) => !c.isDeleted);

    for (let i = 0; i < 50; i++) {
      const parentComment = topLevelComments[i % topLevelComments.length];
      const userId = userIds[(i + 5) % userIds.length];

      replyComments.push(
        commentRepo.create({
          userId,
          artwork: parentComment.artwork,
          sellerId: parentComment.sellerId,
          parent: parentComment,
          content: [
            'Thank you so much!',
            'I appreciate the kind words!',
            'Glad you enjoyed it!',
            'Thanks for the support!',
            'Your feedback means a lot!',
          ][i % 5],
          likeCount: Math.floor(Math.random() * 10),
          replyCount: 0,
          isEdited: false,
          isDeleted: false,
          isFlagged: false,
        }),
      );
    }

    await commentRepo.save(replyComments);
    console.log(`✅ Created ${replyComments.length} reply comments`);

    // ============================================
    // 7. CREATE COMMENT LIKES (300+ likes)
    // ============================================
    console.log('❤️  Creating comment likes...');

    const commentLikes: ArtworkCommentLike[] = [];
    const allComments = [...comments, ...replyComments].filter(
      (c) => !c.isDeleted,
    );

    for (let i = 0; i < 300; i++) {
      const comment = allComments[i % allComments.length];
      const userId = userIds[i % userIds.length];

      // Avoid duplicate likes (userId + commentId must be unique)
      const existingLike = commentLikes.find(
        (cl) => cl.userId === userId && cl.commentId === comment.id,
      );

      if (!existingLike) {
        commentLikes.push(
          commentLikeRepo.create({
            userId,
            comment,
          }),
        );
      }
    }

    await commentLikeRepo.save(commentLikes);
    console.log(`✅ Created ${commentLikes.length} comment likes`);

    // ============================================
    // 8. CREATE ARTWORK LIKES (500+ likes)
    // ============================================
    console.log('💖 Creating artwork likes...');

    const artworkLikes: ArtworkLike[] = [];

    for (let i = 0; i < 500; i++) {
      const artwork = publishedArtworks[i % publishedArtworks.length];
      const userId = userIds[i % userIds.length];

      // Avoid duplicate likes (userId + artworkId must be unique)
      const existingLike = artworkLikes.find(
        (al) => al.userId === userId && al.artworkId === artwork.id,
      );

      if (!existingLike) {
        artworkLikes.push(
          artworkLikeRepo.create({
            userId,
            artwork,
            sellerId: artwork.sellerId,
          }),
        );
      }
    }

    await artworkLikeRepo.save(artworkLikes);
    console.log(`✅ Created ${artworkLikes.length} artwork likes`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('Artwork Service Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`🏷️  Tags:              ${tags.length}`);
    console.log(`📁 Folders:           ${folders.length}`);
    console.log(`🖼️  Artworks:          ${artworks.length}`);
    console.log(`🔗 Artwork-Tags:      ${artworkTags.length}`);
    console.log(
      `💬 Comments:          ${comments.length + replyComments.length}`,
    );
    console.log(`❤️  Comment Likes:    ${commentLikes.length}`);
    console.log(`💖 Artwork Likes:     ${artworkLikes.length}`);
    console.log('═══════════════════════════════════════\n');
  }
}

export default ArtworkSeeder;
