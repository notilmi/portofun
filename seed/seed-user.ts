import { auth } from "@/server/better-auth/auth";

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function seed() {
  const generatedRandomPassword = generateRandomString(12);
  const newAdmin = await auth.api.createUser({
    body: {
      email: "dznilmi@gmail.com", // required
      password: generatedRandomPassword, // required
      name: "Ilmi", // required
      role: "admin", // optional, default is "user"
    },
  });

  console.log("Admin user created:");
  console.log("Email:", newAdmin.user.email);
  console.log("Password:", generatedRandomPassword); // Note: This is the generated password, make sure to store it securely
}

seed();
