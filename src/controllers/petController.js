import PetService from "../services/PetService.js";

const getAllPets = async (req, res) => {
    try {
        const result = await PetService.getAllPets();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

const createPet = async (req, res) => {
    // Handle uploaded files
    const petData = { ...req.body };
    if (req.files && req.files.length > 0) {
        petData.media = req.files.map((file) => ({
            url: `/uploadImagePets/${file.filename}`,
            type: "image",
        }));
    }

    const result = await PetService.createPet(req.user, petData);
    console.log("📤 Result from service:", result);
    return res.status(200).json(result);
};

const getMyPets = async (req, res) => {
    const result = await PetService.getMyPets(req.user);
    return res.status(200).json(result);
};

const getPetById = async (req, res) => {
    const result = await PetService.getPetById(req.user, req.query.pet_id);
    return res.status(200).json(result);
};

const updatePet = async (req, res) => {
    // Handle uploaded files
    const petData = { ...req.body };
    if (req.files && req.files.length > 0) {
        petData.media = req.files.map((file) => ({
            url: `/uploadImagePets/${file.filename}`,
            type: "image",
        }));
    }

    const result = await PetService.updatePet(
        req.user,
        petData.pet_id,
        petData,
    );
    console.log(" Result from service:", result);
    return res.status(200).json(result);
};

const deletePet = async (req, res) => {
    const result = await PetService.deletePet(req.user, req.query.pet_id);
    return res.status(200).json(result);
};

export default {
    getAllPets,
    createPet,
    getMyPets,
    getPetById,
    updatePet,
    deletePet,
};
