import defineAssociations from './src/models/associations';
console.log('Associations imported:', !!defineAssociations);
try {
    defineAssociations();
    console.log('Associations defined successfully');
} catch (e) {
    console.error('Error defining associations:', e);
}
