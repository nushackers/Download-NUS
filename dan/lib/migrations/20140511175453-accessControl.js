module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn(
      'Users',
      'level',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    );
    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.removeColumn(
      'Users',
      'level',
      DataTypes.INTEGER
    );
    done()
  }
}
