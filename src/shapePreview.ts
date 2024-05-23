import {KeywordParams} from "./typeUtils.ts"

interface Vector {
    x: number,
    y: number
}

export class ShapeGenerator {

    div: HTMLDivElement
    params: KeywordParams
    svg: SVGSVGElement
    clouds: NodeList
    scalePoints: Vector[] = []

    constructor(shapeContainingDiv: HTMLDivElement, promptParameters: KeywordParams) {

        this.div = shapeContainingDiv
        this.params = promptParameters
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        this.svg.setAttribute("width", this.div.clientWidth.toString())
        this.svg.setAttribute("height", this.div.clientHeight.toString())
        this.div.appendChild(this.svg)
        setTimeout( () => { this.svg.classList.add("visible") }, 500)

        this.clouds = document.querySelectorAll(".shape-avatar-preview .card-backgrounds .visible")

        let containerRect: DOMRect = this.div.getBoundingClientRect()
        let origin: Vector = {
            x: containerRect.width * 0.5,
            y: containerRect.height * 0.5
        }

        this.clouds.forEach( node => {
            let cloud: HTMLDivElement = node as HTMLDivElement
            let cloudBounds = cloud.getBoundingClientRect()
            let center = {
                x: (cloudBounds.x - containerRect.x) + (cloudBounds.width * 0.5),
                y: (cloudBounds.y - containerRect.y) + (cloudBounds.height * 0.5)
            }

            let param: keyof KeywordParams = cloud.classList[0] as keyof KeywordParams
            let scaledVectorPoint = this.scaleVector(center, origin, this.params[param])
            this.scalePoints.push(scaledVectorPoint)
            this.drawTangentLines(scaledVectorPoint, cloud.classList[0])

        })

        this.scalePoints.forEach((point, index) => {
            this.svg.appendChild( this.drawPoint(point) )
            if (index < this.scalePoints.length - 1) {
                this.svg.appendChild( this.drawLine(point, this.scalePoints[index + 1]) )
            } else {
                this.svg.appendChild( this.drawLine(point, this.scalePoints[0]) )
            }
        })

    }

    drawPoint(point: Vector): SVGCircleElement {
        const circle: SVGCircleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circle.setAttribute("cx", point.x.toString())
        circle.setAttribute("cy", point.y.toString())
        circle.setAttribute("r", "3")
        circle.setAttribute("stroke", "none")

        return circle
    }

    scaleVector(point: Vector, origin: Vector, percentage: number): Vector {

        let scale = (percentage + 25) / 50
        let scaledVectorPoint: Vector = {
            x: origin.x + scale * (point.x - origin.x),
            y: origin.y + scale * (point.y - origin.y)
        }

        return scaledVectorPoint

    }

    drawLine(pointA: Vector, pointB: Vector): SVGLineElement {
        const line: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", pointA.x.toString())
        line.setAttribute("y1", pointA.y.toString())
        line.setAttribute("x2", pointB.x.toString())
        line.setAttribute("y2", pointB.y.toString())
        line.setAttribute("fill", "none")

        return line
    }

    drawTangentLines(point: Vector, trait: string) {

        let axisEndpoints: NodeList = document.querySelectorAll(`.constructed-shape .axis .end.${trait}`)
        let containerRect: DOMRect = this.div.getBoundingClientRect()

        axisEndpoints.forEach( node => {
            let endpoint: HTMLDivElement = node as HTMLDivElement
            let bounds = endpoint.getBoundingClientRect()
            let center = {
                x: (bounds.x - containerRect.x) + (bounds.width * 0.5),
                y: (bounds.y - containerRect.y) + (bounds.height * 0.5)
            }

            this.svg.append(this.drawPoint(center))
            this.svg.append(this.drawLine(center, point))
            
        })


    }

    // this works but is the wrong way:

//    drawTangentLines(point: Vector, origin: Vector) {
//
//        const vector: Vector = {
//            x: point.x - origin.x,
//            y: point.y - origin.y
//        }
//
//        const length = Math.sqrt( (vector.x ** 2) + (vector.y ** 2) )
//        const perpendicular: Vector = {
//            x: -vector.y,
//            y: vector.x
//        }
//
//        const normal = Math.sqrt( (perpendicular.x ** 2) + (perpendicular.y ** 2) )
//        const scaledPerpendicular: Vector = {
//            x: (perpendicular.x / normal) * (length * 0.75),
//            y: (perpendicular.y / normal) * (length * 0.75)
//        }
//
//        const controlPointA: Vector = {
//            x: point.x + scaledPerpendicular.x,
//            y: point.y + scaledPerpendicular.y
//        }
//
//        const controlPointB: Vector = {
//            x: point.x - scaledPerpendicular.x,
//            y: point.y - scaledPerpendicular.y
//        }
//
//        this.svg.append(this.drawPoint(controlPointA))
//        this.svg.append(this.drawPoint(controlPointB))
//
//        this.svg.append(this.drawLine(controlPointA, point))
//        this.svg.append(this.drawLine(controlPointB, point))
//
//    }

}