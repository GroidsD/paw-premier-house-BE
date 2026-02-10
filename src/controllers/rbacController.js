import RbacService from "../services/RbacService";



const getAllPermissions = async (req, res) => {
    try {
        const data = await RbacService.getAllPermissions();
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ getAllPermissions:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};

const createPermission = async (req, res) => {
    try {
        const data = await RbacService.createPermission(req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ createPermission:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};

const deletePermission = async (req, res) => {
    try {
        const { id } = req.body;
        const data = await RbacService.deletePermission(id);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ deletePermission:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};



const getAllRoles = async (req, res) => {
    try {
        const data = await RbacService.getAllRoles();
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ getAllRoles:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};

const createRole = async (req, res) => {
    try {
        const data = await RbacService.createRole(req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ createRole:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { id } = req.body;
        const data = await RbacService.deleteRole(id);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ deleteRole:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};



const setPermissionsForRole = async (req, res) => {
    try {
        const { role_id, permission_ids } = req.body;

        if (!role_id || !Array.isArray(permission_ids)) {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Invalid input",
            });
        }

        const data = await RbacService.setPermissionsForRole(
            role_id,
            permission_ids,
        );

        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ setPermissionsForRole:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};



const setRolesForUser = async (req, res) => {
    try {
        const { user_id, role_ids } = req.body;

        if (!user_id || !Array.isArray(role_ids)) {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Invalid input",
            });
        }

        const data = await RbacService.setRolesForUser(user_id, role_ids);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ setRolesForUser:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};



const setUserPermission = async (req, res) => {
    try {
        const { user_id, permission_id, allowed } = req.body;

        if (!user_id || !permission_id || typeof allowed !== "boolean") {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Invalid input",
            });
        }

        const data = await RbacService.setUserPermission(
            user_id,
            permission_id,
            allowed,
        );

        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ setUserPermission:", e);
        return res.status(500).json({
            errCode: 500,
            errMessage: "Server error",
        });
    }
};

const getUserPermissionDetail = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await RbacService.getUserPermissionDetail(user_id);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ getUserPermissionDetail:", e);
        return res
            .status(500)
            .json({ errCode: 500, errMessage: "Server error" });
    }
};


const setUserOverridesBulk = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { overrides } = req.body;

        if (!user_id || typeof overrides !== "object" || overrides === null) {
            return res
                .status(400)
                .json({ errCode: 1, errMessage: "Invalid input" });
        }

        const data = await RbacService.setUserOverridesBulk(user_id, overrides);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ setUserOverridesBulk:", e);
        return res
            .status(500)
            .json({ errCode: 500, errMessage: "Server error" });
    }
};

export default {
    getAllPermissions,
    createPermission,
    deletePermission,
    getAllRoles,
    createRole,
    deleteRole,
    setPermissionsForRole,
    setRolesForUser,
    setUserPermission,
    setUserOverridesBulk,
    getUserPermissionDetail,
};
