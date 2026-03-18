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
    try {
        const petData = { ...req.body };

        if (req.files && req.files.length > 0) {
            petData.media = req.files.map((file, index) => ({
                url: `/uploadImagePets/${file.filename}`,
                is_main: index === 0,
                alt_text: petData.name || null,
            }));
        }

        const result = await PetService.createPet(req.user, petData);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || "Server error",
        });
    }
};

const getMyPets = async (req, res) => {
    try {
        const result = await PetService.getMyPets(req.user);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || "Server error",
        });
    }
};

const getPetById = async (req, res) => {
    try {
        const result = await PetService.getPetById(req.user, req.query.pet_id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || "Server error",
        });
    }
};

const updatePet = async (req, res) => {
    try {
        const petData = { ...req.body };

        let existingMedia = [];
        if (petData.existingMedia) {
            try {
                existingMedia =
                    typeof petData.existingMedia === "string"
                        ? JSON.parse(petData.existingMedia)
                        : petData.existingMedia;
            } catch (e) {
                existingMedia = [];
            }
        }

        const uploadedMedia =
            req.files && req.files.length > 0
                ? req.files.map((file) => ({
                      url: `/uploadImagePets/${file.filename}`,
                      is_main: false,
                      alt_text: petData.name || null,
                  }))
                : [];

        if (uploadedMedia.length > 0 || petData.existingMedia) {
            petData.media = [...existingMedia, ...uploadedMedia];

            // gán ảnh đầu tiên là main nếu có media
            petData.media = petData.media.map((item, index) => ({
                ...item,
                is_main: index === 0,
            }));
        }

        const result = await PetService.updatePet(
            req.user,
            petData.pet_id,
            petData,
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || "Server error",
        });
    }
};

const deletePet = async (req, res) => {
    try {
        const result = await PetService.deletePet(req.user, req.query.pet_id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || "Server error",
        });
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
