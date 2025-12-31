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
    const result = await PetService.createPet(req.user, req.body);
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
    const result = await PetService.updatePet(
        req.user,
        req.body.pet_id,
        req.body
    );
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
