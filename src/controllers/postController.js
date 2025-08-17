import Joi from 'joi';
import { Post } from '../models/Post.js';
import { slugify } from '../utils/slugify.js';

const baseSchema = {
  title: Joi.string().min(3).max(160).required(),
  content: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string()).default([]),
  published: Joi.boolean().default(true)
};
const createSchema = Joi.object(baseSchema);
const updateSchema = Joi.object({
  title: baseSchema.title.optional(),
  content: baseSchema.content.optional(),
  tags: baseSchema.tags.optional(),
  published: baseSchema.published.optional()
}).min(1);

const commentSchema = Joi.object({ content: Joi.string().min(1).max(500).required() });

export const createPost = async (req, res, next) => {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d=>d.message) });
    const slug = slugify(value.title);
    const exists = await Post.findOne({ slug });
    const post = await Post.create({
      ...value,
      slug: exists ? `${slug}-${Date.now()}` : slug,
      author: req.user._id
    });
    res.status(201).json({ data: post });
  } catch (e) { next(e); }
};

export const listPosts = async (req, res, next) => {
  try {
    const { q, tag, author, page = 1, limit = 10, sort = '-createdAt', published } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    if (typeof published !== 'undefined') filter.published = published === 'true';
    const skip = (Number(page)-1) * Number(limit);
    const [items, total] = await Promise.all([
      Post.find(filter).populate('author', 'username role').sort(sort).skip(skip).limit(Number(limit)),
      Post.countDocuments(filter)
    ]);
    res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total/Number(limit)||1) } });
  } catch (e) { next(e); }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'username role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ data: post });
  } catch (e) { next(e); }
};

export const updatePost = async (req, res, next) => {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d=>d.message) });
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Only author or admin
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(post, value);
    if (value.title) post.slug = slugify(value.title) + '-' + post._id.toString().slice(-6);
    await post.save();
    res.json({ data: post });
  } catch (e) { next(e); }
};

export const removePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) != String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.findIndex(u => String(u) === String(req.user._id));
    if (idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx < 0 });
  } catch (e) { next(e); }
};

export const addComment = async (req, res, next) => {
  try {
    const { value, error } = commentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details.map(d=>d.message) });
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user._id, content: value.content });
    await post.save();
    res.status(201).json({ comments: post.comments });
  } catch (e) { next(e); }
};

export const removeComment = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const c = post.comments.id(req.params.commentId);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    if (String(c.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    c.deleteOne();
    await post.save();
    res.json({ comments: post.comments });
  } catch (e) { next(e); }
};
