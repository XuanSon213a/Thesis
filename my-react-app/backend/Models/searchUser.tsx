import UserModel from '../Models/UserModel';

async function searchUser(request, response) {
    try {
        const { search } = request.body;

        // Use only the "i" flag for case-insensitive matching
        const query = new RegExp(search, "i");

        const users = await UserModel.find({
            "$or": [
                { name: query },
                { email: query }
            ]
        }).select("-password");

        return response.json({
            message: 'All users',
            data: users,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

export default searchUser;
