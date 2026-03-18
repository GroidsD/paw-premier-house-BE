import db from "../models/index.js";
import MediaService from "./MediaService.js";
import { safeUnlinkByUrl } from "../helper/safeUnlinkByUrl.js";

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
            { transaction: t },
        );

        if (Array.isArray(data.media) && data.media.length > 0) {
            await MediaService.createMediaForEntity(
                data.media,
                pet.pet_id,
                "pet",
                t,
            );
        }

        await t.commit();

        const createdPet = await db.Pet.findByPk(pet.pet_id, {
            include: [{ model: db.Media, as: "media" }],
        });

        return { errCode: 0, pet: createdPet };
    } catch (error) {
        await t.rollback();
        return { errCode: 1, errMessage: error.message };
    }
};

const getMyPets = async (user) => {
    try {
        const pets = await db.Pet.findAll({
            where: { owner_id: user.user_id },
            include: [{ model: db.Media, as: "media" }],
            order: [["created_at", "DESC"]],
        });

        return { errCode: 0, pets };
    } catch (error) {
        return { errCode: 1, errMessage: error.message };
    }
};

const getPetById = async (user, pet_id) => {
    try {
        const pet = await db.Pet.findByPk(pet_id, {
            include: [{ model: db.Media, as: "media" }],
        });

        if (!pet) return { errCode: 1, errMessage: "Pet not found" };

        if (user.role === "customer" && pet.owner_id !== user.user_id) {
            return { errCode: 2, errMessage: "Permission denied" };
        }

        return { errCode: 0, pet };
    } catch (error) {
        return { errCode: 1, errMessage: error.message };
    }
};

const updatePet = async (user, pet_id, data) => {
    const t = await db.sequelize.transaction();
    try {
        const pet = await db.Pet.findByPk(pet_id, { transaction: t });

        if (!pet) {
            await t.rollback();
            return { errCode: 1, errMessage: "Pet not found" };
        }

        if (user.role === "customer" && pet.owner_id !== user.user_id) {
            await t.rollback();
            return { errCode: 2, errMessage: "Permission denied" };
        }

        const oldMedia = await db.Media.findAll({
            where: { entity_id: pet_id, entity_type: "pet" },
            transaction: t,
        });

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
            { transaction: t },
        );

        if (Array.isArray(data.media)) {
            await MediaService.updateMediaForEntity(
                data.media,
                pet_id,
                "pet",
                t,
            );
        }

        await t.commit();

        // Xóa file vật lý của những ảnh không còn dùng nữa
        if (Array.isArray(data.media)) {
            const newUrls = new Set(data.media.map((m) => m.url));
            const removedMedia = oldMedia.filter((m) => !newUrls.has(m.url));

            for (const media of removedMedia) {
                await safeUnlinkByUrl(media.url);
            }
        }

        const updatedPet = await db.Pet.findByPk(pet_id, {
            include: [{ model: db.Media, as: "media" }],
        });

        return { errCode: 0, pet: updatedPet };
    } catch (error) {
        await t.rollback();
        return { errCode: 1, errMessage: error.message };
    }
};

const deletePet = async (user, pet_id) => {
    const t = await db.sequelize.transaction();
    try {
        const pet = await db.Pet.findByPk(pet_id, { transaction: t });

        if (!pet) {
            await t.rollback();
            return { errCode: 1, errMessage: "Pet not found" };
        }

        if (user.role === "customer" && pet.owner_id !== user.user_id) {
            await t.rollback();
            return { errCode: 2, errMessage: "Permission denied" };
        }

        const medias = await db.Media.findAll({
            where: { entity_id: pet_id, entity_type: "pet" },
            transaction: t,
        });

        await db.Media.destroy({
            where: { entity_id: pet_id, entity_type: "pet" },
            transaction: t,
        });

        await pet.destroy({ transaction: t });

        await t.commit();

        // Xóa file vật lý sau khi commit DB thành công
        for (const media of medias) {
            await safeUnlinkByUrl(media.url);
        }

        return { errCode: 0, errMessage: "Pet deleted successfully" };
    } catch (error) {
        await t.rollback();
        return { errCode: 1, errMessage: error.message };
    }
};

export default {
    getAllPets,
    createPet,
    getMyPets,
    getPetById,
    updatePet,
    deletePet,
};
