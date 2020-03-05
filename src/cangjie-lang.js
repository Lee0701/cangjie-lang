
class CangjieCharacter {
    constructor(x, y, w, h, data, from=0, to=-1) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.data = data

        const count = this.count()
        this.processFrom(from)
        if(to !== -1) this.processTo(count - to)
        this.cleanUp()
    }
    count() {
        if(typeof this.data === 'string' && this.data !== 'Z') return 1
        if(Array.isArray(this.data)) {
            let sum = 0
            for(const child of this.data) {
                sum += child.count()
            }
            return sum
        }
        return 0
    }
    processFrom(from) {
        if(Array.isArray(this.data)) {
            for(const child of this.data) {
                if(from <= 0) break
                if(child && typeof child.data === 'string' && child.data !== 'Z') {
                    this.data[this.data.indexOf(child)] = undefined
                    from -= 1
                }
                else if(Array.isArray(child.data)) {
                    from = child.processFrom(from)
                }
            }
        }
        return from
    }
    processTo(to) {
        if(Array.isArray(this.data)) {
            for(const child of this.data.reverse()) {
                if(to <= 0) break
                if(child && typeof child.data === 'string' && child.data !== 'Z') {
                    this.data[this.data.indexOf(child)] = undefined
                    to -= 1
                }
                else if(Array.isArray(child.data)) {
                    to = child.processTo(to)
                }
            }
        }
        return to
    }
    cleanUp() {
        if(Array.isArray(this.data)) {
            this.data = this.data.filter(child => child)
            this.data.forEach(child => child.cleanUp())
        }
    }
    render(ctx, x, y, w, h) {
        x += this.x * w
        y += this.y * h
        w *= this.w
        h *= this.h

        if(Array.isArray(this.data)) {
            this.data.forEach((child) => {
                child.render(ctx, x, y, w, h)
            })
        } else if(typeof this.data === 'string') {
            ctx.beginPath()
            if(this.data === 'H') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data === 'SH') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data === 'U') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data === 'DU') {
                
            } else if(this.data == 'V') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h)
                ctx.stroke()
            } else if(this.data === 'SV') {
                ctx.moveTo(x + w, y)
                ctx.lineTo(x, y + h)
                ctx.stroke()
            } else if(this.data === 'RSV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'T') {
                ctx.moveTo(x + w, y)
                ctx.quadraticCurveTo(x + w*2/3, y + h*2/3, x, y + h)
                ctx.stroke()
            } else if(this.data === 'HV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            }
            ctx.closePath()
        }
    }
}

const combiners = {
    '+': [{x: 0, y: 0, w: 1, h: 1}, {x: 0, y: 0, w: 1, h: 1}],
    '-': [{x: 0, y: 0, w: 0.5, h: 1}, {x: 0.5, y: 0, w: 0.5, h: 1}],
    '|': [{x: 0, y: 0, w: 1, h: 0.5}, {x: 0, y: 0.5, w: 1, h: 0.5}],
    '=': [{x: 0, y: 0, w: 0.33, h: 1}, {x: 0.33, y: 0, w: 0.66, h: 1}],
    ':': [{x: 0, y: 0, w: 1, h: 0.33}, {x: 0, y: 0.33, w: 1, h: 0.66}],
    '!': [{x: 0, y: 0, w: 1, h: 0.66}, {x: 0, y: 0.66, w: 1, h: 0.33}],
    '#': [{x: 0, y: 0, w: 1, h: 1}, {x: 0.125, y: 0.125, w: 0.75, h: 0.75}],
}

class Cangjie {
    constructor(data) {
        this.data = data
    }

    parseNums(nums) {
        let x = 0
        let y = 0
        let w = 1
        let h = 1
        if(nums.length >= 1) {
            x = y = nums[0]
            w = h = (1 - x*2)
        }
        if(nums.length >= 2) {
            y = nums[1]
            h = (1 - y*2)
        }
        if(nums.length == 4) {
            w = nums[2]
            h = nums[3]
        }
        return {x, y, w, h}
    }
    
    parse(arr) {
        if(typeof arr === 'string') arr = arr.split('')

        const next = () => {
            if(!arr.length) return null
            while(arr[0] === ' ') arr.shift()
            return arr.shift().toUpperCase()
        }

        const parseCombiner = () => {
            const left = parseTerm()
            const ch = next()
            const c = combiners[ch]
            if(c) {
                const right = parseCombiner()
                return new CangjieCharacter(0, 0, 1, 1, [left, right].map((char, i) => new CangjieCharacter(c[i].x, c[i].y, c[i].w, c[i].h, [char])))
            } else return left
        }

        const parseTerm = () => {
            let ch = next()

            let from = 0
            if(ch >= '0' && ch <= '9') {
                from = ''
                for( ; ch >= '0' && ch <= '9' ; ch = next()) from += ch
                from = parseInt(from)
            }
            let to = -1
            if(ch === '~') {
                ch = next()
                to = ''
                for( ; ch >= '0' && ch <= '9' ; ch = next()) to += ch
                to = parseInt(to)
            }

            let result = null
            if(ch === '(') result = [parseCombiner()]
            else {
                let token = ch
                while(arr.length && arr[0].toUpperCase() >= 'A' && arr[0].toUpperCase() <= 'Z') token += next()
                if(this.data[token]) token = [this.parse(this.data[token])]
                result = token
            }

            if(arr[0] === '@') {
                next()
                const nums = []
                while(arr.length && arr[0].toUpperCase() >= '0' && arr[0].toUpperCase() <= '9') {
                    const num = parseInt(next())
                    const denom = parseInt(next())
                    nums.push(num / (denom === 0 ? 10 : denom))
                }
                const {x, y, w, h} = this.parseNums(nums)
                return new CangjieCharacter(x, y, w, h, result, from, to)
            } else {
                return new CangjieCharacter(0, 0, 1, 1, result, from, to)
            }
        }

        return parseCombiner()
    }
}

if(module) module.exports = {Cangjie}
