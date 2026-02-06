package com.clock_in_out.controller;

import com.clock_in_out.model.Terminal;
import com.clock_in_out.repository.TerminalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terminals")
@CrossOrigin(origins = "*")
public class TerminalController {

    private final TerminalRepository terminalRepository;

    public TerminalController(TerminalRepository terminalRepository) {
        this.terminalRepository = terminalRepository;
    }

    @GetMapping
    public List<Terminal> getAllTerminals() {
        return terminalRepository.findAll();
    }

    @PostMapping("/authorize")
    public Terminal authorizeDevice(@RequestBody Terminal terminal){
        return terminalRepository.save(terminal);
    }

    @DeleteMapping("/{id}")
    public void deleteTerminal(@PathVariable Long id){
        terminalRepository.deleteById(id);
    }

    @GetMapping("/check/{key}")
    public boolean checkAccess(@PathVariable String key){
        return terminalRepository.findByDeviceKey(key).isPresent();
    }
}
