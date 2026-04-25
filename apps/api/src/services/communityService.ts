import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function uniqueSlug(table: 'blogPost' | 'event', base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const exists = table === 'blogPost'
      ? await prisma.blogPost.findUnique({ where: { slug } })
      : null; // Events don't require unique slugs
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// ── Blog Posts ──────────────────────────────────────────────────────────────

export async function listBlogPosts(query: {
  page?: number;
  limit?: number;
  artistId?: string;
  tag?: string;
}) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    status: 'PUBLISHED' as const,
    ...(query.artistId ? { authorId: query.artistId } : {}),
    ...(query.tag ? { tags: { has: query.tag } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { author: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { posts, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getBlogPost(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { author: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
  });
  if (!post) throw new AppError(404, 'Blog post not found');
  return post;
}

export async function createBlogPost(artistUserId: string, data: {
  title: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  coverS3Key?: string;
  tags?: string[];
  publish?: boolean;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId: artistUserId } });
  if (!artist) throw new AppError(403, 'Artist profile required');

  const slug = await uniqueSlug('blogPost', toSlug(data.title));
  const status = data.publish ? 'PUBLISHED' : 'DRAFT';

  return prisma.blogPost.create({
    data: {
      authorId: artist.id,
      title: data.title,
      slug,
      summary: data.summary,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      coverS3Key: data.coverS3Key,
      tags: data.tags ?? [],
      status,
      publishedAt: data.publish ? new Date() : null,
    },
    include: { author: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
  });
}

export async function updateBlogPost(postId: string, artistUserId: string, data: {
  title?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  coverS3Key?: string;
  tags?: string[];
  publish?: boolean;
  archive?: boolean;
}) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: { author: true },
  });
  if (!post) throw new AppError(404, 'Blog post not found');
  if (post.author.userId !== artistUserId) throw new AppError(403, 'Not authorized');

  const status = data.archive ? 'ARCHIVED' : data.publish ? 'PUBLISHED' : undefined;
  const publishedAt = data.publish && !post.publishedAt ? new Date() : undefined;

  return prisma.blogPost.update({
    where: { id: postId },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.content ? { content: data.content } : {}),
      ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
      ...(data.coverS3Key !== undefined ? { coverS3Key: data.coverS3Key } : {}),
      ...(data.tags ? { tags: data.tags } : {}),
      ...(status ? { status } : {}),
      ...(publishedAt ? { publishedAt } : {}),
    },
  });
}

// ── Events ──────────────────────────────────────────────────────────────────

export async function listEvents(query: {
  page?: number;
  limit?: number;
  eventType?: string;
  country?: string;
  upcoming?: boolean;
}) {
  const { page, limit, skip } = getPaginationOptions(query);
  const now = new Date();
  const where = {
    isPublished: true,
    ...(query.eventType ? { eventType: query.eventType as any } : {}),
    ...(query.country ? { country: query.country } : {}),
    ...(query.upcoming ? { startDate: { gte: now } } : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
    }),
    prisma.event.count({ where }),
  ]);

  return { events, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, 'Event not found');
  return event;
}

export async function createEvent(organizerId: string, data: {
  title: string;
  description?: string;
  eventType?: string;
  city: string;
  state?: string;
  country?: string;
  venue?: string;
  address?: string;
  startDate: Date;
  endDate: Date;
  websiteUrl?: string;
  imageUrl?: string;
  imageS3Key?: string;
  publish?: boolean;
}) {
  return prisma.event.create({
    data: {
      organizerId,
      title: data.title,
      description: data.description,
      eventType: (data.eventType as any) ?? 'CONVENTION',
      city: data.city,
      state: data.state,
      country: data.country ?? 'US',
      venue: data.venue,
      address: data.address,
      startDate: data.startDate,
      endDate: data.endDate,
      websiteUrl: data.websiteUrl,
      imageUrl: data.imageUrl,
      imageS3Key: data.imageS3Key,
      isPublished: data.publish ?? false,
    },
  });
}

export async function updateEvent(eventId: string, organizerId: string, data: {
  title?: string;
  description?: string;
  city?: string;
  state?: string;
  venue?: string;
  address?: string;
  startDate?: Date;
  endDate?: Date;
  websiteUrl?: string;
  isPublished?: boolean;
}) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, 'Event not found');
  if (event.organizerId !== organizerId) throw new AppError(403, 'Not authorized');
  return prisma.event.update({ where: { id: eventId }, data });
}

// ── Apprenticeships ─────────────────────────────────────────────────────────

export async function listApprenticeships(query: {
  page?: number;
  limit?: number;
  country?: string;
}) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    isOpen: true,
    ...(query.country ? { country: query.country } : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.apprenticeshipListing.findMany({
      where,
      include: { artist: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.apprenticeshipListing.count({ where }),
  ]);

  return { listings, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getApprenticeship(id: string) {
  const listing = await prisma.apprenticeshipListing.findUnique({
    where: { id },
    include: { artist: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
  });
  if (!listing) throw new AppError(404, 'Apprenticeship listing not found');
  return listing;
}

export async function createApprenticeship(artistUserId: string, data: {
  title: string;
  description: string;
  requirements?: string;
  duration?: string;
  isPaid?: boolean;
  compensation?: string;
  city: string;
  state?: string;
  country?: string;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId: artistUserId } });
  if (!artist) throw new AppError(403, 'Artist profile required');

  return prisma.apprenticeshipListing.create({
    data: { artistId: artist.id, ...data },
    include: { artist: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
  });
}

export async function updateApprenticeship(listingId: string, artistUserId: string, data: {
  title?: string;
  description?: string;
  requirements?: string;
  duration?: string;
  isPaid?: boolean;
  compensation?: string;
  isOpen?: boolean;
}) {
  const listing = await prisma.apprenticeshipListing.findUnique({
    where: { id: listingId },
    include: { artist: true },
  });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.artist.userId !== artistUserId) throw new AppError(403, 'Not authorized');
  return prisma.apprenticeshipListing.update({ where: { id: listingId }, data });
}

// ── InkSync Academy (Courses) ───────────────────────────────────────────────

export async function listCourses(query: {
  page?: number;
  limit?: number;
  tag?: string;
  isFree?: boolean;
}) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    status: 'PUBLISHED' as const,
    ...(query.tag ? { tags: { has: query.tag } } : {}),
    ...(query.isFree !== undefined ? { isFree: query.isFree } : {}),
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        _count: { select: { lessons: true, enrollments: true } },
      },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      lessons: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) throw new AppError(404, 'Course not found');
  return course;
}

export async function createCourse(artistUserId: string, data: {
  title: string;
  description: string;
  coverImageUrl?: string;
  coverS3Key?: string;
  price?: number;
  isFree?: boolean;
  tags?: string[];
  publish?: boolean;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId: artistUserId } });
  if (!artist) throw new AppError(403, 'Artist profile required');

  return prisma.course.create({
    data: {
      instructorId: artist.id,
      title: data.title,
      description: data.description,
      coverImageUrl: data.coverImageUrl,
      coverS3Key: data.coverS3Key,
      price: data.price ?? 0,
      isFree: data.isFree ?? data.price === 0,
      tags: data.tags ?? [],
      status: data.publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: data.publish ? new Date() : null,
    },
    include: { instructor: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
  });
}

export async function addLesson(artistUserId: string, courseId: string, data: {
  title: string;
  content: string;
  videoUrl?: string;
  sortOrder?: number;
  durationMin?: number;
}) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { instructor: true },
  });
  if (!course) throw new AppError(404, 'Course not found');
  if (course.instructor.userId !== artistUserId) throw new AppError(403, 'Not authorized');

  return prisma.courseLesson.create({ data: { courseId, ...data } });
}

export async function enrollInCourse(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== 'PUBLISHED') throw new AppError(404, 'Course not found');

  const existing = await prisma.courseEnrollment.findUnique({ where: { courseId_userId: { courseId, userId } } });
  if (existing) throw new AppError(409, 'Already enrolled');

  return prisma.courseEnrollment.create({ data: { courseId, userId } });
}

export async function completeLesson(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (!enrollment) throw new AppError(404, 'Not enrolled in this course');

  return prisma.courseEnrollment.update({
    where: { courseId_userId: { courseId, userId } },
    data: { completedAt: new Date() },
  });
}

export async function getUserEnrollments(userId: string, query: { page?: number; limit?: number }) {
  const { page, limit, skip } = getPaginationOptions(query);

  const [enrollments, total] = await Promise.all([
    prisma.courseEnrollment.findMany({
      where: { userId },
      include: { course: { include: { instructor: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } } } },
      skip,
      take: limit,
      orderBy: { enrolledAt: 'desc' },
    }),
    prisma.courseEnrollment.count({ where: { userId } }),
  ]);

  return { enrollments, meta: buildPaginationMeta(total, { page, limit, skip }) };
}
