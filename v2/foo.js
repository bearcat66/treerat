var rev = new Map()
console.log(rev)
rev.set('1313', 'location')
console.log(rev)
rev.get('1313')
var rev2 = {}
rev2['1313'] = 'loc'
rev2['1311'] = 'loc'
var keys = Object.keys(rev2)
console.log(keys)
console.log(rev2['1311'])
