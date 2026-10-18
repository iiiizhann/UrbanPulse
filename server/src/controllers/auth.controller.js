import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, preferredCities } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Citizen',
      preferredCities: preferredCities || ['Pune'],
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferredCities: user.preferredCities,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferredCities: user.preferredCities,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};