var Sequelize = require('sequelize');
var config = require('./config');

try {
    var sequelize = new Sequelize(config.db.database, config.db.user, config.db.pass, config.db.opt);

    var Schema = sequelize.import(__dirname + '/schema.js');

    var User = Schema.User;
    var Dataset = Schema.Dataset;
    var DataCategory = Schema.DataCategory;
    var DataType = Schema.DataType;
    var DataFile = Schema.DataFile;

    sequelize.sync().success(function(){
        // If your db engine does not support FULLTEXT indexes, it will fail here!
        sequelize.query('ALTER TABLE Datasets ADD FULLTEXT(name, description);');
   
        DataCategory.create({ name: 'Uncategorized' });
        DataCategory.create({ name: 'Biology' });
        DataCategory.create({ name: 'Chemistry' });
        DataCategory.create({ name: 'Mathematics' });
        DataCategory.create({ name: 'Physics' });
        DataCategory.create({ name: 'Programming' });
        DataCategory.create({ name: 'Sociology' });

        DataType.create({ name: 'Unclassified' });
        DataType.create({ name: 'Synthetic' });
        DataType.create({ name: 'Real-world' });
    });

} catch(e) {
    console.log(e);
}
