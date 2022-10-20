import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
import { hasChanged, isObject } from "../shared";

// 1 true "1"
// get set
// proxy -> object
// {} -> value get set 
// 

class RefImpl {
  private _value: any;
  public dep;
  public _rawValue: any;
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    // value -> reactive
    // 1. 看看value 是不是对象 
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 一定是先修改了value的值，在进行修改

    // newValue -> this._value
    if(hasChanged(newValue,this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if(isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 看看是不是ref-> ref.value
  // ref
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs,{
    get(target, key) {
      // get -> age(ref) 那么就给他返回 .value
      // no ref -> value
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      // set -> ref .value
      if(isRef(target[key]) && !isRef(value)) {
        return target[key].value = value;
      } else {
        return Reflect.set(target, key, value);
      }
    }
  })
}