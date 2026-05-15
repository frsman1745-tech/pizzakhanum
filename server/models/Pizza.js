import mongoose from "mongoose";

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pizza name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["classic", "special", "vegetarian", "spicy", "seafood"],
      default: "classic",
    },
    available: {
      type: Boolean,
      default: true,
    },
    toppings: {
      type: [String],
      default: [],
    },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

const Pizza = mongoose.model("Pizza", pizzaSchema);

export default Pizza;
