import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router()
const prisma = new PrismaClient()

//create user--------->

router.post('/', async (req, res) => {
    const { email, name, username } = req.body;

    try {
        //check if user already exist----->
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existingUser) {
            //if email or username already exist return a error 400
            return res.status(400).json({ message: "email or username already exist" })
        }
        //creating a user if email or username not exist in database
        const createUser = await prisma.user.create({
            data: {
                email, name, username, bio: "Hello ,I'm new on twitter"
            }
        });
        res.json(createUser);

    } catch (error) {
        // Handle any database errors
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

//list all users--------->

router.get('/', async (_, res) => {
    const getAllUser = await prisma.user.findMany(
        /*{
            if we want to select specific data to show------>
            select: {
                    id: true,
                    name: true,
                    image: true,
                }
         }*/
    );
    res.json(getAllUser);
})

//get one user----------->

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const getOneUser = await prisma.user.findUnique({ where: { id: Number(id) }, include: { tweets: true }, })
        if (getOneUser) {
            res.json(getOneUser)
        } else {
            res.status(400).json({ message: "User not found" })
        }
    } catch (error) {
        console.error("error fetching user:", error)
        res.status(500).json({ message: "Internal server error" })
    }

})

//update user-------->

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { bio, name, image } = req.body;

    try {
        // Check if the user exists
        const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { bio, name, image },
        });

        // Send the updated user in the response
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update the user" });
    }
});

//delete user--------->

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Delete the user from the database
        await prisma.user.delete({ where: { id: parseInt(id) } });

        // Send a success response
        res.sendStatus(200);
    } catch (error) {
        // Handle errors
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});


export default router;