import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    key:   { type: String, unique: true, default: "global" },
    name:  { type: String, default: "بيتزا خانم" },
    slogan: { type: String, default: "كُل لتعيش · وعِش لأجل البيتزا" },
    whatsapp: { type: String, default: "963998950904" },
  },
  { timestamps: true, collection: "settings" }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
