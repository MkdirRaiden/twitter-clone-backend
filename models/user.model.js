import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    passwordUpdatedAt: Date,
  },
  { timestamps: true }
);

// Pre-save hook for hashing password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.confirmPassword) delete this.confirmPassword;
  }
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword, hashedPassword) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// Instance method: check if password changed after token issued
userSchema.methods.isPasswordUpdated = function (issuedTime) {
  if (this.passwordUpdatedAt) {
    const updatedTime = Math.floor(this.passwordUpdatedAt.getTime() / 1000);
    return issuedTime < updatedTime;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
export default User;
