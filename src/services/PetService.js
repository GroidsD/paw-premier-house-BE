import db from "../models/index.js";
import MediaService from "./MediaService.js";
const getAllPets = async () => {
    try {
        const pets = await db.Pet.findAll({
            include: [
                {
                    model: db.User,
                    as: "owner",
                    attributes: ["user_id", "fullname", "email"],
                },
                {
                    model: db.Media,
                    as: "media",
                },
            ],
            order: [["created_at", "DESC"]],
        });

        return {
            errCode: 0,
            pets,
        };
    } catch (error) {
        console.error("❌ getAllPets error:", error);
        return {
            errCode: 1,
            errMessage: "Failed to fetch pets",
        };
    }
};

/* ======================
   CREATE PET
====================== */
const createPet = async (user, data) => {
    const t = await db.sequelize.transaction();
    try {
        const pet = await db.Pet.create(
            {
                owner_id: user.user_id,
                name: data.name,
                species: data.species,
                breed: data.breed,
                gender: data.gender,
                age: data.age,
                weight: data.weight,
                description: data.description,
            },
            { transaction: t }
        );

        if (Array.isArray(data.media)) {
            await MediaService.createMediaForEntity(
                data.media,
                pet.pet_id,
                "pet",
                t
            );
        }

        await t.commit();

        return { errCode: 0, pet };
    } catch (error) {
        await t.rollback();
        return { errCode: 1, errMessage: error.message };
    }
};

/* ======================
   GET MY PETS
====================== */
const getMyPets = async (user) => {
    const pets = await db.Pet.findAll({
        where: { owner_id: user.user_id },
        include: [{ model: db.Media, as: "media" }],
        order: [["created_at", "DESC"]],
    });

    return { errCode: 0, pets };
};

/* ======================
   GET PET BY ID
====================== */
const getPetById = async (user, pet_id) => {
    const pet = await db.Pet.findByPk(pet_id, {
        include: [{ model: db.Media, as: "media" }],
    });

    if (!pet) return { errCode: 1, errMessage: "Pet not found" };

    if (user.role === "customer" && pet.owner_id !== user.user_id) {
        return { errCode: 2, errMessage: "Permission denied" };
    }

    return { errCode: 0, pet };
};

/* ======================
   UPDATE PET
====================== */
const updatePet = async (user, pet_id, data) => {
    const t = await db.sequelize.transaction();
    try {
        const pet = await db.Pet.findByPk(pet_id);
        if (!pet) return { errCode: 1, errMessage: "Pet not found" };

        if (user.role === "customer" && pet.owner_id !== user.user_id) {
            return { errCode: 2, errMessage: "Permission denied" };
        }

        await pet.update(
            {
                name: data.name ?? pet.name,
                species: data.species ?? pet.species,
                breed: data.breed ?? pet.breed,
                gender: data.gender ?? pet.gender,
                age: data.age ?? pet.age,
                weight: data.weight ?? pet.weight,
                description: data.description ?? pet.description,
            },
            { transaction: t }
        );

        if (Array.isArray(data.media)) {
            await MediaService.updateMediaForEntity(
                data.media,
                pet_id,
                "pet",
                t
            );
        }

        await t.commit();
        return { errCode: 0, pet };
    } catch (error) {
        await t.rollback();
        return { errCode: 1, errMessage: error.message };
    }
};

/* ======================
   DELETE PET
====================== */
const deletePet = async (user, pet_id) => {
    const pet = await db.Pet.findByPk(pet_id);
    if (!pet) return { errCode: 1, errMessage: "Pet not found" };

    if (user.role === "customer" && pet.owner_id !== user.user_id) {
        return { errCode: 2, errMessage: "Permission denied" };
    }

    await pet.destroy(); // afterDestroy auto xóa media
    return { errCode: 0, errMessage: "Pet deleted successfully" };
};

export default {
    getAllPets,
    createPet,
    getMyPets,
    getPetById,
    updatePet,
    deletePet,
};
