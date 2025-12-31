import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// inngest func to save user data to database

export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.create(userData);
  }
);

// inngest function to update user data in database

export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  }
);

// inngest func to delete user from database

export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();
    await User.findByIdAndDelete(id);
  }
);

//inngest func to create user order in DB

export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxsize: 5,
      timeout: "5s",
    },
  },
  {
    event: "order/created",
  },
  async ({ events }) => {
    await connectDB();
    const orders = [];
    for (const event of events) {
        orders.push({
          userId: event.data.userId,
          items: event.data.items,
          amount: event.data.amount,
          address: event.data.address,
          date: event.data.date,
        });
    }
    await Order.insertMany(orders);
    return { success: true, processed: orders.length };
  }
);
