/**
 * UI behavior tests:
 *  - QuantityStepper: min enforcement, increment/decrement callbacks
 *  - VariantSelector: chip rendering, selection callback
 *  - Accordion toggle via StepHeader
 *  - Variant switching in ProductCard (store integration)
 *  - Required-product stepper minimum via ReviewLineRow
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import bundleReducer, { seedItems, setActiveStep } from "@/store/bundleSlice";
import QuantityStepper from "@/components/ui/QuantityStepper";
import VariantSelector from "@/components/ui/VariantSelector";
import StepHeader from "@/components/builder/StepHeader";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({ reducer: { bundle: bundleReducer } });
}

// ─── QuantityStepper — min enforcement ───────────────────────────────────────

describe("QuantityStepper", () => {
  it("disables the decrement button when value equals min", () => {
    render(<QuantityStepper value={1} min={1} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
  });

  it("enables the decrement button when value is above min", () => {
    render(<QuantityStepper value={2} min={1} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Decrease quantity")).not.toBeDisabled();
  });

  it("calls onChange with value - 1 when decrement is clicked", () => {
    const onChange = jest.fn();
    render(<QuantityStepper value={3} min={1} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("calls onChange with value + 1 when increment is clicked", () => {
    const onChange = jest.fn();
    render(<QuantityStepper value={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not call onChange when decrement is clicked at min", () => {
    const onChange = jest.fn();
    render(<QuantityStepper value={1} min={1} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("defaults min to 0 — decrement is enabled at value 1", () => {
    render(<QuantityStepper value={1} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Decrease quantity")).not.toBeDisabled();
  });

  it("displays the current value", () => {
    render(<QuantityStepper value={7} onChange={jest.fn()} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

// ─── VariantSelector ─────────────────────────────────────────────────────────

describe("VariantSelector", () => {
  const variants = [
    { id: "white", label: "White", color: "#fff" },
    { id: "black", label: "Black", color: "#000" },
    { id: "grey",  label: "Grey",  color: "#888" },
  ];

  it("renders a button for each variant", () => {
    render(<VariantSelector variants={variants} selected="white" onSelect={jest.fn()} />);
    expect(screen.getByLabelText("White")).toBeInTheDocument();
    expect(screen.getByLabelText("Black")).toBeInTheDocument();
    expect(screen.getByLabelText("Grey")).toBeInTheDocument();
  });

  it("calls onSelect with the correct id when a chip is clicked", () => {
    const onSelect = jest.fn();
    render(<VariantSelector variants={variants} selected="white" onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText("Black"));
    expect(onSelect).toHaveBeenCalledWith("black");
  });

  it("calls onSelect with the correct id for any variant", () => {
    const onSelect = jest.fn();
    render(<VariantSelector variants={variants} selected="black" onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText("Grey"));
    expect(onSelect).toHaveBeenCalledWith("grey");
  });

  it("calls onSelect when the already-selected chip is clicked", () => {
    const onSelect = jest.fn();
    render(<VariantSelector variants={variants} selected="white" onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText("White"));
    // onSelect is still invoked — the caller decides whether to update state
    // This test documents the current behavior: the callback fires regardless
    expect(onSelect).toHaveBeenCalledWith("white");
  });
});

// ─── Accordion (StepHeader) ───────────────────────────────────────────────────

describe("StepHeader accordion", () => {
  function renderHeader(isOpen: boolean, onClick = jest.fn()) {
    return render(
      <StepHeader
        stepNum={1}
        title="Cameras"
        category="cameras"
        selectedCount={0}
        isOpen={isOpen}
        onClick={onClick}
      />,
    );
  }

  it("has aria-expanded=false when closed", () => {
    renderHeader(false);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("has aria-expanded=true when open", () => {
    renderHeader(true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onClick when the header button is clicked", () => {
    const onClick = jest.fn();
    renderHeader(false, onClick);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows a selected count badge when selectedCount > 0", () => {
    render(
      <StepHeader stepNum={1} title="Cameras" category="cameras"
        selectedCount={3} isOpen={false} onClick={jest.fn()} />,
    );
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("does not show a selected count badge when selectedCount is 0", () => {
    renderHeader(false);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });
});

// ─── Accordion toggle via Redux store ────────────────────────────────────────

describe("accordion store behavior", () => {
  it("setActiveStep opens the targeted step", () => {
    const store = makeStore();
    store.dispatch(setActiveStep(3));
    expect(store.getState().bundle.activeStep).toBe(3);
  });

  it("setActiveStep(0) closes all steps", () => {
    const store = makeStore();
    store.dispatch(setActiveStep(2));
    store.dispatch(setActiveStep(0));
    expect(store.getState().bundle.activeStep).toBe(0);
  });

  it("setting the same step again keeps it open (toggling is a UI concern)", () => {
    const store = makeStore();
    store.dispatch(setActiveStep(2));
    store.dispatch(setActiveStep(2));
    expect(store.getState().bundle.activeStep).toBe(2);
  });
});

// ─── Variant switching (store integration) ───────────────────────────────────

describe("variant switching in the store", () => {
  it("selecting a different variant creates a new line item", () => {
    const store = makeStore();
    store.dispatch(seedItems([{ productId: "cam", variantId: "white", qty: 2 }]));
    store.dispatch(setActiveStep(1));

    // Simulate user picking a different variant and adding it
    store.dispatch({ type: "bundle/setQty", payload: { productId: "cam", variantId: "black", qty: 1 } });

    const items = store.getState().bundle.items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.variantId === "white")?.qty).toBe(2);
    expect(items.find((i) => i.variantId === "black")?.qty).toBe(1);
  });

  it("switching variant does not alter the qty of the previously selected variant", () => {
    const store = makeStore();
    store.dispatch(seedItems([{ productId: "cam", variantId: "white", qty: 3 }]));
    store.dispatch({ type: "bundle/setQty", payload: { productId: "cam", variantId: "grey", qty: 2 } });

    expect(store.getState().bundle.items.find((i) => i.variantId === "white")?.qty).toBe(3);
  });
});
