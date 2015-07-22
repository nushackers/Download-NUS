module.exports = function(sequelize, DataTypes) {
    
    var User = sequelize.define('User', {
        nusId: { type: DataTypes.STRING, unique: true },
        name:  DataTypes.STRING,
        level: { type: DataTypes.INTEGER, defaultValue: 1}
    });

    var Dataset = sequelize.define('Dataset', {
        shortId:     { type: DataTypes.STRING, unique: true },
        name:        DataTypes.STRING,
        description: DataTypes.TEXT
    });

    var DataCategory = sequelize.define('DataCategory', {
        name: { type: DataTypes.STRING, unique: true }
    });

    var DataType = sequelize.define('DataType', {
        name: { type: DataTypes.STRING, unique: true }
    });

    var DataFile = sequelize.define('DataFile', {
        filepath: DataTypes.STRING
    });
    
    User.hasMany(Dataset);
    Dataset.belongsTo(User);
    
    DataCategory.hasOne(Dataset);
    Dataset.belongsTo(DataCategory);
    
    DataType.hasOne(Dataset);
    Dataset.belongsTo(DataType);
    
    Dataset.hasMany(DataFile);
    DataFile.belongsTo(Dataset);
    
    return {
        User: User,
        Dataset: Dataset,
        DataCategory: DataCategory,
        DataType: DataType,
        DataFile: DataFile
    };
}