
class CangjieCharacter {
    constructor(x, y, w, h, data) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.data = data
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
                ctx.moveTo(x, 0)
                ctx.lineTo(x + w, 0)
                ctx.stroke()
            } else if(this.data === 'SH') {
                ctx.moveTo(0, y + h)
                ctx.lineTo(0 + w, y)
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
    '.': [{x: 0, y: 0, w: 1, h: 1}],
    '+': [{x: 0, y: 0, w: 1, h: 1}, {x: 0, y: 0, w: 1, h: 1}],
    '-': [{x: 0, y: 0, w: 0.5, h: 1}, {x: 0.5, y: 0, w: 0.5, h: 1}],
    '|': [{x: 0, y: 0, w: 1, h: 0.5}, {x: 0, y: 0.5, w: 1, h: 0.5}],
    '=': [{x: 0, y: 0, w: 0.33, h: 1}, {x: 0.33, y: 0, w: 0.66, h: 1}],
    ':': [{x: 0, y: 0, w: 1, h: 0.33}, {x: 0, y: 0.33, w: 1, h: 0.66}],
    '!': [{x: 0, y: 0, w: 1, h: 0.66}, {x: 0, y: 0.66, w: 1, h: 0.33}],
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
        let num = null
        const nums = []
        while(arr.length) {
            const ch = arr.shift().toUpperCase()
            if(ch === ';') continue
            else if(ch >= '0' && ch <= '9') {
                if(num === null) num = parseInt(ch)
                else {
                    nums.push(num / (ch === '0' ? 10 : parseInt(ch)))
                    num = null
                }
            }
            else if(Object.keys(combiners).includes(ch)) {
                const {x, y, w, h} = this.parseNums(nums)
                const children = combiners[ch].map(c => new CangjieCharacter(c.x, c.y, c.w, c.h, [this.parse(arr)]))
                return new CangjieCharacter(x, y, w, h, children)
            }
            else if(ch >= 'A' && ch <= 'Z') {
                let token = ch
                while(arr.length && arr[0].toUpperCase() >= 'A' && arr[0].toUpperCase() <= 'Z') token += arr.shift().toUpperCase()
                const {x, y, w, h} = this.parseNums(nums)
                return new CangjieCharacter(x, y, w, h, token)
            } else {
                const {x, y, w, h} = this.parseNums(nums)
                return new CangjieCharacter(x, y, w, h, [this.parse(this.data[ch])])
            }
        }
    }
}

if(module) module.exports = {Cangjie}
