router.get('/vaccinations', async (req, res) => {
    const { vaccineName, page = 1, limit = 10 } = req.query;
  
    const matchStage = vaccineName
      ? { 'vaccinations.vaccineName': vaccineName }
      : {};
  
    try {
      const students = await Student.aggregate([
        { $match: { 'vaccinations.0': { $exists: true }, ...matchStage } },
        { $unwind: '$vaccinations' },
        ...(vaccineName ? [{ $match: { 'vaccinations.vaccineName': vaccineName } }] : []),
        {
          $lookup: {
            from: 'drives',
            localField: 'vaccinations.driveId',
            foreignField: '_id',
            as: 'drive'
          }
        },
        { $unwind: { path: '$drive', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            studentId: 1,
            name: 1,
            class: 1,
            vaccineName: '$vaccinations.vaccineName',
            date: '$vaccinations.date',
            vaccinated: 1,
            driveTitle: '$drive.title'
          }
        },
        { $sort: { date: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ]);
  
      res.json({ data: students });
    } catch (err) {
      res.status(500).json({ error: 'Report generation failed' });
    }
  });
  

  module.exports = router;